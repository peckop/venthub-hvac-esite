export const dataTable = {
      bulk: {
        selectedCount: '{count} items selected',
        clear: 'Clear selection',
        activateItems: 'Activate selected',
        deactivateItems: 'Deactivate selected',
        deleteItems: 'Delete selected',
        archiveItems: 'Archive selected'
      },
      filter: {
        clearAll: 'Clear all filters',
        facetEmpty: 'No results for this filter'
      },
      // ColumnsMenu (kit-wide: all 14 admin tables share this menu).
      columns: {
        title: 'Active Columns',
        density: 'Row Density',
        densityComfortable: 'Comfortable (Default)',
        densityCompact: 'Compact (Maximum Data)'
      },
      states: {
        loading: 'Loading...',
        error: 'An error occurred while loading data',
        accessDenied: 'You do not have permission to view this content'
      },
      pagination: {
        page: 'Page',
        of: '/',
        rowsPerPage: 'Rows per page',
        previous: 'Previous page',
        next: 'Next page',
        total: 'Total'
      },
      labels: {
        selectAll: 'Select all',
        rowSelect: 'Select row',
        expand: 'Toggle row details'
      },
      export: {
        csv: 'Download CSV',
        fileFormat: 'File Format'
      },
      // CSV import file gate (ADM-6, csv-import-export-standard §1.2).
      csvImport: {
        wrongExtension: 'Only files with the .csv extension can be uploaded.',
        wrongType: 'The file is not CSV text. Save the sheet as "CSV UTF-8" and upload it again.',
        fileTooLarge: 'The file exceeds the {{maxMb}} MB limit. Split the file and upload the parts.',
        empty: 'The file must contain a header row and at least one data row.',
        tooManyRows: 'The file has more than {{maxRows}} data rows. Split the file and upload the parts.',
        unclosedQuote: 'The file has an unclosed quote ("), so it could not be read.',
        duplicateHeader: 'The same column name appears more than once in the header row.'
      }
};
