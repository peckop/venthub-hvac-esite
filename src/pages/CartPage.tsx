import React from 'react'
import { useCart } from '../hooks/useCart'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BrandIcon } from '../components/HVACIcons'
import SecurityRibbon from '../components/SecurityRibbon'

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeFromCart, clearCart, getCartTotal, getCartCount } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-light-gray">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <ShoppingBag size={48} className="text-steel-gray" />
            </div>
            <h2 className="text-2xl font-bold text-industrial-gray mb-4">
              Sepetiniz Boş
            </h2>
            <p className="text-steel-gray mb-8">
              Henüz sepetinize ürün eklemediniz. Alışverişe başlamak için ürünlerimizi inceleyin.
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-primary-navy hover:bg-secondary-blue text-white font-semibold rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Alışverişe Başla
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light-gray">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-4">
              <SecurityRibbon />
            </div>
          {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-industrial-gray mb-2">
            Alışveriş Sepeti
          </h1>
          <p className="text-steel-gray">
            {getCartCount()} ürün sepetinizde
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-light-gray p-6">
                <div className="flex items-start space-x-4">
                  {/* Product Image Placeholder */}
                  <div className="w-20 h-20 bg-gradient-to-br from-air-blue to-light-gray rounded-lg flex items-center justify-center flex-shrink-0">
                    <BrandIcon brand={item.product.brand} />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.product.id}`}
                      className="block hover:text-primary-navy transition-colors"
                    >
                      <h3 className="font-semibold text-industrial-gray mb-1">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-steel-gray mb-2">
                      {item.product.brand} • {item.product.sku}
                    </p>
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-bold text-primary-navy">
                        ₺{parseFloat(item.product.price).toLocaleString('tr-TR')}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-sm text-steel-gray">
                          Toplam: ₺{(parseFloat(item.product.price) * item.quantity).toLocaleString('tr-TR')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-light-gray rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-2 hover:bg-light-gray transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} className="text-steel-gray" />
                      </button>
                      <span className="px-4 py-2 font-medium text-industrial-gray">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-2 hover:bg-light-gray transition-colors"
                      >
                        <Plus size={16} className="text-steel-gray" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-steel-gray hover:text-red-500 transition-colors"
                      title="Ürünü Kaldır"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Clear Cart Button */}
            <div className="pt-4">
              <button
                onClick={clearCart}
                className="text-steel-gray hover:text-red-500 text-sm transition-colors"
              >
                Sepeti Temizle
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-light-gray p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-industrial-gray mb-6">
                Sipariş Özeti
              </h2>

              {/* Order Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-steel-gray">Ara Toplam</span>
                  <span className="font-medium text-industrial-gray">
                    ₺{getCartTotal().toLocaleString('tr-TR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-steel-gray">Kargo</span>
                  <span className="text-success-green font-medium">Bedava</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-steel-gray">KDV (%20, dahil)</span>
                  <span className="font-medium text-industrial-gray">
                    ₺{(getCartTotal() - getCartTotal() / 1.2).toLocaleString('tr-TR')}
                  </span>
                </div>
                <hr className="border-light-gray" />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-industrial-gray">Toplam</span>
                  <span className="font-bold text-primary-navy">
                    ₺{getCartTotal().toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                to="/checkout"
                className="w-full bg-primary-navy hover:bg-secondary-blue text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center block"
              >
                Siparişi Tamamla
              </Link>

              {/* Continue Shopping */}
              <Link
                to="/"
                className="w-full mt-3 border-2 border-primary-navy text-primary-navy hover:bg-primary-navy hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center block"
              >
                Alışverişe Devam Et
              </Link>

              {/* Security Info */}
              <div className="mt-6 p-4 bg-air-blue rounded-lg">
                <p className="text-sm text-steel-gray text-center">
                  🔒 Güvenli ödeme sistemi ile korunmaktadır
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage