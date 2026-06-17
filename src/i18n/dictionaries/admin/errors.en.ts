export const errors = {
      subtitle: 'Monitor, filter and inspect client-side errors.',
      levelTitle: 'Level',
      envTitle: 'Environment',
      detailsTitle: 'Details',
      emptyTitle: 'No Errors Found',
      emptyDescription: 'No client errors have been recorded yet.',
      filterEmptyDescription: 'No recorded error matches the selected date range and filters.',
      labels: {
        stack: 'Stack',
        ua: 'UA',
        release: 'Release',
        env: 'Env'
      },
      table: {
        date: 'Date',
        level: 'Level',
        message: 'Message',
        url: 'URL'
      },
      export: {
        csvLabel: 'CSV (UTF-8 BOM)',
        filename: 'client_errors.csv',
        headers: {
          id: 'ID',
          at: 'Date',
          level: 'Level',
          message: 'Message',
          url: 'URL',
          userAgent: 'UA',
          release: 'Release',
          env: 'Env'
        }
      }
};
