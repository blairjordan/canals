const express = require("express")
const cors = require("cors")
const { postgraphile, makePluginHook } = require("postgraphile")
const { default: PgPubsub } = require("@graphile/pg-pubsub")

const graphqlRoute = "/graphql"
const graphiqlRoute = "/graphiql"

const app = express()
const pluginHook = makePluginHook([PgPubsub])

// Allow all CORS requests
app.use(cors())

// 🩺 Health check
app.get("/healthz", (req, res) => {
  res.json({ status: "ok" })
})

app.use(
  postgraphile(
    process.env.DATABASE_URL ||
      "postgres://canaluser:canalpassword@localhost:5432/canaldb",
    "public",
    {
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
      appendPlugins: [require("@graphile-contrib/pg-simplify-inflector")],
      exportGqlSchemaPath: "schema.graphql",
      enhanceGraphiql: true,
      enableQueryBatching: true,
      legacyRelations: "omit",
      graphiql: true,
    }
  )
)

const port = process.env.PORT || 3000

console.info(
  `🛥 GraphQL server running @ http://localhost:${port}${graphqlRoute}`
)
console.info(
  `🌍 GraphiQL (Web UI) available @ http://localhost:${port}${graphiqlRoute}`
)
app.listen(port)
