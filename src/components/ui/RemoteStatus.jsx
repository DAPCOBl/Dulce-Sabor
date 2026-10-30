function RemoteStatus({ loading, error, retry }) {
  if (!loading && !error) return null
  return <section className="ui__remote" aria-busy={loading}>
    <p role={error ? 'alert' : 'status'}>{loading ? 'Cargando información…' : error}</p>
    {error && <button type="button" className="ui__boton ui__boton--secundario" onClick={retry}>Reintentar</button>}
  </section>
}
export default RemoteStatus
