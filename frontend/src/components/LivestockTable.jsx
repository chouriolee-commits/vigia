import './LivestockTable.css'

// Tabla genérica reutilizada por 003-livestock-monitoring, 006-alert-system y 012-events-log
// (el nombre viene de la primera spec que la definió — ver esos design.md).
// columns: [{ key, header, render?(row) }]   rows: object[]
export default function LivestockTable({ columns, rows, emptyMessage = 'Sin datos.', rowKey = 'id', onRowClick }) {
  if (!rows || rows.length === 0) {
    return <div className="livestock-table-empty">{emptyMessage}</div>
  }

  return (
    <div className="livestock-table-scroll">
      <table className="livestock-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row[rowKey] ?? i}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? 'is-clickable' : undefined}
            >
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
