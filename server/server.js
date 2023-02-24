const express = require("express")
const { postgraphile, makePluginHook } = require("postgraphile")
const { default: PgPubsub } = require("@graphile/pg-pubsub")

const app = express()

const pluginHook = makePluginHook([PgPubsub])

app.use(
  postgraphile(
    process.env.DATABASE_URL ||
      "postgres://canaluser:canalpassword@localhost:5432/canaldb",
    "public",
    {
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

app.listen(process.env.PORT || 3000)
