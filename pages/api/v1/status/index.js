import database from "infra/database.js"

async function status(req, res) {
    const updatedAt = new Date().toISOString();

    const {rows: databaseVersionResult} = await database.query("SHOW server_version;")
    const databaseVersionValue = databaseVersionResult[0].server_version

    const { rows: databaseMaxConnectionsResult } = await database.query("SHOW max_connections;")
    const databaseMaxConnectionsValue = parseInt(databaseMaxConnectionsResult[0].max_connections)

    const databaseName = process.env.POSTGRES_DB
    const { rows: databaseActiveConnectionsResult } = await database.query({
        text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
        values: [databaseName]
    });
    const databaseActiveConnectionsValue = databaseActiveConnectionsResult[0].count

    res.status(200).json({
        updated_at: updatedAt,
        dependencies: {
            database: {
                version: databaseVersionValue,
                max_connections: databaseMaxConnectionsValue,
                active_connections: databaseActiveConnectionsValue
            }
        }
    })
}

export default status;