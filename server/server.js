const express = require("express")
const cors = require("cors")
const { postgraphile, makePluginHook } = require("postgraphile")
const { default: PgPubsub } = require("@graphile/pg-pubsub")
const ConnectionFilterPlugin = require("postgraphile-plugin-connection-filter")
const { Pool } = require("pg")
const { transloaditCallback } = require("./transloadit")

const graphqlRoute = "/graphql"
const graphiqlRoute = "/graphiql"
const callbackRoute = "/transloadit_callback"

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://canaluser:canalpassword@localhost:5432/canaldb",
})

const app = express()
const pluginHook = makePluginHook([PgPubsub])

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 🩺 Health check
app.get("/healthz", (req, res) => {
  res.json({ status: "ok" })
})

// 🖼 Route for transloadit notifications
app.post(callbackRoute, transloaditCallback(pool))

app.use(
  postgraphile(pool, "public", {
    pgSettings: (req) => {
      const settings = {
        role: "anonymous",
      }
      if (req.headers && req.headers.x_player_id) {
        settings["player.id"] = req.headers.x_player_id
        settings.role = "authenticated_user"
      }
      return settings
    },
    ownerConnectionString: process.env.DATABASE_URL,
    graphqlRoute,
    graphiqlRoute,
    pluginHook,
    subscriptions: true,
    simpleSubscriptions: true,
    watchPg: true,
    dynamicJson: true,
    setofFunctionsContainNulls: false,
    ignoreRBAC: false,
    showErrorStack: "json",
    extendedErrors: ["hint", "detail", "errcode"],
    appendPlugins: [
      require("@graphile-contrib/pg-simplify-inflector"),
      ConnectionFilterPlugin,
    ],
    exportGqlSchemaPath: "schema.graphql",
    enhanceGraphiql: true,
    enableQueryBatching: true,
    legacyRelations: "omit",
    graphiql: true,
  })
)

const port = process.env.PORT || 3000

console.info(
  `🛥 GraphQL server running @ http://localhost:${port}${graphqlRoute}`
)
console.info(
  `🌍 GraphiQL (Web UI) available @ http://localhost:${port}${graphiqlRoute}`
)
app.listen(port)
