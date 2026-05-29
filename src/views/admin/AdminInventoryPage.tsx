'use client';


import React, { useState, useEffect, useMemo } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { supabase } from '../../lib/supabase';
import { 
  Package, 
  Search, 
  RefreshCw, 
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import InventoryTable from '../../components/admin/InventoryTable';
import type { Database } from '../../types/database.types';
import { LoadState, Density } from '../../types/admin-shared';

type InventorySummaryRow = Database['public']['Views']['inventory_summary']['Row'] & { category_id?: string | null };
type Category = Database['public']['Tables']['categories']['Row'];

const AdminInventoryPage: React.FC = () => {
  const { t: _t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<InventorySummaryRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterStockStatus] = useState<'all' | 'low' | 'out'>('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, catRes] = await Promise.all([
        supabase.from('inventory_summary').select('product_id, name, supplier_name, warehouse_location, physical_stock, reserved_stock, available_stock').order('name'),
        supabase.from('categories').select('id, name, parent_id, slug, is_active, sort_order, level, image_url, seo_title, seo_desc, created_at, updated_at, description, display_mode, is_featured, marketing_title, menu_label, metadata, translation_key, authority_content').order('name')
      ]);

      if (invRes.error) throw invRes.error;
      if (catRes.error) throw catRes.error;

      setData(invRes.data || []);
      setCategories(catRes.data || []);
    } catch (err: unknown) {
      console.error('Inventory fetch error:', err);
      toast.error('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = !searchTerm || item.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filterCategory || 
        item.category_id === filterCategory;
      const stock = item.physical_stock || 0;
      const threshold = 5; 
      
      const matchesStock = filterStockStatus === 'all' ||
        (filterStockStatus === 'low' && stock <= threshold && stock > 0) ||
        (filterStockStatus === 'out' && stock <= 0);

      return matchesSearch && matchesCategory && matchesStock;
    }).map(item => ({
      product_id: item.product_id || '',
      name: item.name || 'İsimsiz Ürün',
      physical_stock: item.physical_stock || 0,
      reserved_stock: item.reserved_stock || 0,
      available_stock: item.available_stock || 0,
      warehouse_location: item.warehouse_location,
      supplier_name: item.supplier_name
    }));
  }, [data, searchTerm, filterCategory, filterStockStatus]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-industrial-gray flex items-center gap-2">
            <Package className="text-primary-navy" />
            Envanter Yönetimi
          </h1>
          <p className="text-steel-gray text-sm">Stok durumlarını yönetin.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-2 text-steel-gray hover:text-primary-navy rounded-lg">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="flex items-center gap-2 bg-primary-navy text-white px-4 py-2 rounded-lg font-bold">
            <Plus size={20} />
            <span>Stok Hareketi</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-light-gray shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-gray" size={18} />
          <input 
            type="text"
            placeholder="Ürün adı ile ara..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-gray-200 rounded-lg focus-visible:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="bg-gray-50 border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus-visible:outline-none"
            value={filterCategory || ''}
            onChange={(e) => setFilterCategory(e.target.value || null)}
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center"><RefreshCw className="animate-spin mx-auto mb-4 text-primary-navy" /></div>
      ) : (
        <InventoryTable 
          rows={filteredData} 
          loading={loading ? LoadState.Loading : LoadState.Idle}
          error=""
          selected={null}
          visibleCols={{ 
            name: true, 
            physical: true, 
            reserved: true, 
            available: true, 
            threshold: true, 
            status: true, 
            location: true, 
            supplier: true, 
            abc: false, 
            days: false 
          }}
          density={'comfortable' as Density}
          sortKey={"name"}
          sortDir="asc"
          groupByCategory={false}
          groupedRows={[]}
          onSort={() => {}}
          onSelect={() => {}}
          onUpdateLocation={async () => {}}
          onUpdateSupplier={async () => {}}
          
          hasWriteAccess={true}
          thresholdMap={{}}
          defaultThreshold={5}
          effectiveThreshold={() => 5}
        />
      )}
    </div>
  );
};

export default AdminInventoryPage;
