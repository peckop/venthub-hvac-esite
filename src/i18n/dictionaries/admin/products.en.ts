export const products = {
      toolbar: {
        categoryTitle: 'Category',
        allCategories: 'All Categories'
      },
      toggles: {
        featuredOnly: 'Only: Featured'
      },
      statusLabels: {
        active: 'Active',
        inactive: 'Inactive',
        out_of_stock: 'Out of Stock'
      },
      table: {
        image: 'Image',
        name: 'Name',
        sku: 'SKU',
        category: 'Category',
        status: 'Status',
        price: 'Price',
        stock: 'Stock',
        actions: 'Actions'
      },
      export: {
        csvLabel: 'CSV (UTF-8 BOM)'
      },
      import: {
        button: 'Import (beta)',
        previewTitle: 'CSV Preview (first 10 rows) — Total: {{total}}',
        close: 'Close',
        dryRun: 'Dry-run',
        dryRunResult: 'Dry-run: required fields are {{status}}. Valid rows: {{ok}}/{{total}}',
        statusComplete: 'complete',
        statusMissing: 'missing',
        writeButton: 'Write (upsert by SKU)',
        needCsv: 'Select a CSV first',
        minColumns: 'At least sku and name columns are required',
        noneFound: 'No valid rows found',
        done: 'Import finished: {{ok}} rows processed, {{fail}} rows failed',
        error: 'Import error: {{msg}}'
      },
      edit: {
        editing: 'Editing',
        new: 'New Product',
        tabs: {
          info: 'Info',
          pricing: 'Pricing',
          stock: 'Stock',
          images: 'Images',
          seo: 'SEO'
        },
        actions: {
          new: 'New',
          save: 'Save',
          delete: 'Delete'
        },
        info: {
          name: 'Name',
          sku: 'SKU',
          modelCode: 'Model Code (MPN)',
          modelPlaceholder: 'e.g., AD-H-900-T',
          brand: 'Brand',
          status: 'Status',
          category: 'Category',
          categoryUnset: '(Not selected)',
          featured: 'Featured'
        },
        pricing: {
          salePrice: 'Sale Price',
          purchasePrice: 'Purchase Cost',
          salePlaceholder: 'e.g., 1999.90',
          purchasePlaceholder: 'e.g., 1499.50'
        },
        stock: {
          stock: 'Stock',
          lowThreshold: 'Low Stock Threshold',
          stockPlaceholder: 'e.g., 50',
          lowPlaceholder: 'e.g., 5',
          hintBase: 'If empty, default threshold in Settings is used',
          defaultSuffix: ' (Default: {{default}})'
        },
        images: {
          saveFirst: 'Save the product first.',
          none: 'No images yet. Select files to upload.',
          altPlaceholder: 'Alt text',
          up: 'Up',
          down: 'Down',
          makeCover: 'Make Cover',
          delete: 'Delete'
        },
        seo: {
          slug: 'Slug',
          slugPlaceholder: 'sample-product',
          slugRequired: 'Slug cannot be empty',
          slugInUse: 'This slug is already in use',
          metaTitle: 'Meta Title',
          metaDesc: 'Meta Description',
          chars: '{{count}} characters'
        }
      },
      toasts: {
        loadFailed: 'Could not load',
        altSaveFailed: 'Could not save alt text: {{msg}}',
        imagesSaved: 'Images saved',
        imagesSaveFailed: 'Could not save images: {{msg}}',
        orderNotChanged: 'Order not changed',
        seoSaveFailed: 'Could not save SEO: {{msg}}',
        productLoadFailed: 'Could not load product: {{msg}}',
        saveFailed: 'Could not save: {{msg}}',
        priceSaveFailed: 'Could not save price: {{msg}}',
        stockSaveFailed: 'Could not save stock: {{msg}}',
        deleteFailed: 'Could not delete: {{msg}}'
      },
      confirm: {
        deleteImage: 'Do you want to delete the image?',
        deleteProduct: 'Do you want to delete this product?'
      },
      form: {
        category: 'Category',
        name: 'Product Name',
        outOfStock: 'Out of Stock',
        price: 'Price',
        select: 'Select'
      }
};
