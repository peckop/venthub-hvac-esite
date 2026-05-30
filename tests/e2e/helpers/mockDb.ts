/* eslint-disable */
export interface SecurityContext {
  tenantId: string | null
  userRole: string | null
}

export class MockQueryBuilder {
  private tableName: string
  private db: MockDatabaseEngine
  private filters: Array<(row: any) => boolean> = []
  private queryType: 'select' | 'insert' | 'update' | 'delete' = 'select'
  private payload: any = null
  private isSingle = false
  private isMaybeSingle = false

  constructor(tableName: string, db: MockDatabaseEngine) {
    this.tableName = tableName
    this.db = db
  }

  select(columns?: string) {
    this.queryType = 'select'
    return this
  }

  insert(payload: any | any[]) {
    this.queryType = 'insert'
    this.payload = payload
    return this
  }

  update(payload: Partial<any>) {
    this.queryType = 'update'
    this.payload = payload
    return this
  }

  delete() {
    this.queryType = 'delete'
    return this
  }

  eq(column: string, value: any) {
    this.filters.push((row) => row[column] === value)
    return this
  }

  single() {
    this.isSingle = true
    return this
  }

  maybeSingle() {
    this.isMaybeSingle = true
    return this
  }

  async then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<any> {
    try {
      const result = await this.db.executeQuery({
        tableName: this.tableName,
        queryType: this.queryType,
        payload: this.payload,
        filters: this.filters,
        isSingle: this.isSingle,
        isMaybeSingle: this.isMaybeSingle,
      })
      if (onfulfilled) {
        return onfulfilled(result)
      }
      return result
    } catch (err) {
      if (onrejected) {
        return onrejected(err)
      }
      throw err
    }
  }
}

export class MockDatabaseEngine {
  private tables = new Map<string, any[]>()
  private securityContext: SecurityContext = { tenantId: null, userRole: null }

  setTableData(tableName: string, data: any[]) {
    this.tables.set(tableName, JSON.parse(JSON.stringify(data)))
  }

  getTableData(tableName: string): any[] {
    return this.tables.get(tableName) || []
  }

  clearTable(tableName: string) {
    this.tables.set(tableName, [])
  }

  setSecurityContext(context: Partial<SecurityContext>) {
    this.securityContext = { ...this.securityContext, ...context }
  }

  getSecurityContext(): SecurityContext {
    return this.securityContext
  }

  createClient() {
    return {
      from: (tableName: string) => new MockQueryBuilder(tableName, this),
    }
  }

  async executeQuery(query: {
    tableName: string
    queryType: 'select' | 'insert' | 'update' | 'delete'
    payload: any
    filters: Array<(row: any) => boolean>
    isSingle: boolean
    isMaybeSingle: boolean
  }): Promise<{ data: any; error: any }> {
    const { tableName, queryType, payload, filters, isSingle, isMaybeSingle } = query
    let data = this.getTableData(tableName)
    const { tenantId, userRole } = this.securityContext

    // Check if table contains rows with tenant_id or if we should apply tenant constraints.
    // If there is any row in the DB with tenant_id, or if we define table as tenant-specific.
    const hasTenantIdColumn = data.length > 0 && 'tenant_id' in data[0]

    // Helper to evaluate row access under Row Level Security (RLS)
    const isTenantAuthorized = (row: any) => {
      // If table/row has no tenant_id, RLS bypasses it or relies on custom policies
      if (hasTenantIdColumn && 'tenant_id' in row) {
        if (userRole === 'super_admin') return true
        return row.tenant_id === tenantId
      }
      return true
    }

    if (queryType === 'select') {
      // Apply RLS boundaries first
      let filtered = data.filter(isTenantAuthorized)

      // Apply programmatic filters (like `.eq`)
      for (const filter of filters) {
        filtered = filtered.filter(filter)
      }

      if (isSingle) {
        if (filtered.length === 0) {
          return { data: null, error: { message: 'No rows found', code: 'PGRST116' } }
        }
        if (filtered.length > 1) {
          return { data: null, error: { message: 'More than one row found', code: 'PGRST116' } }
        }
        return { data: filtered[0], error: null }
      }

      if (isMaybeSingle) {
        if (filtered.length === 0) return { data: null, error: null }
        return { data: filtered[0], error: null }
      }

      return { data: filtered, error: null }
    }

    if (queryType === 'insert') {
      const rowsToInsert = Array.isArray(payload) ? payload : [payload]
      const inserted: any[] = []

      for (const row of rowsToInsert) {
        const newRow = { ...row }

        // RLS boundary enforcement on insert
        if (hasTenantIdColumn || 'tenant_id' in newRow) {
          if (userRole !== 'super_admin') {
            if (newRow.tenant_id && newRow.tenant_id !== tenantId) {
              return { data: null, error: { message: 'RLS violation: tenant mismatch', code: '42501' } }
            }
            newRow.tenant_id = tenantId
          } else if (!newRow.tenant_id) {
            newRow.tenant_id = tenantId
          }
        }

        // Generate primary key if missing
        if (!newRow.id) {
          newRow.id = Math.random().toString(36).substring(2, 11)
        }

        data.push(newRow)
        inserted.push(newRow)
      }

      this.tables.set(tableName, data)
      const returnData = Array.isArray(payload) ? inserted : inserted[0]
      return { data: returnData, error: null }
    }

    if (queryType === 'update') {
      let affectedIndices: number[] = []

      for (let i = 0; i < data.length; i++) {
        const row = data[i]
        if (!isTenantAuthorized(row)) continue

        let matches = true
        for (const filter of filters) {
          if (!filter(row)) {
            matches = false
            break
          }
        }
        if (matches) {
          affectedIndices.push(i)
        }
      }

      const updatedRows: any[] = []
      for (const idx of affectedIndices) {
        const row = data[idx]
        const updatedRow = { ...row, ...payload }

        // Prevent modification of tenant_id if it violates security context
        if (hasTenantIdColumn && userRole !== 'super_admin' && updatedRow.tenant_id !== tenantId) {
          return { data: null, error: { message: 'RLS violation: cannot modify tenant_id', code: '42501' } }
        }

        data[idx] = updatedRow
        updatedRows.push(updatedRow)
      }

      this.tables.set(tableName, data)

      if (isSingle) {
        if (updatedRows.length === 0) {
          return { data: null, error: { message: 'No rows updated', code: 'PGRST116' } }
        }
        return { data: updatedRows[0], error: null }
      }
      return { data: updatedRows, error: null }
    }

    if (queryType === 'delete') {
      const remaining: any[] = []
      const deleted: any[] = []

      for (const row of data) {
        const isTarget = (() => {
          if (!isTenantAuthorized(row)) return false
          for (const filter of filters) {
            if (!filter(row)) return false
          }
          return true
        })()

        if (isTarget) {
          deleted.push(row)
        } else {
          remaining.push(row)
        }
      }

      this.tables.set(tableName, remaining)
      return { data: deleted, error: null }
    }

    return { data: null, error: { message: 'Unknown query type' } }
  }
}
