const express = require("express")
const cors = require("cors")
const { postgraphile, makePluginHook } = require("postgraphile")
const { default: PgPubsub } = require("@graphile/pg-pubsub")
const ConnectionFilterPlugin = require("postgraphile-plugin-connection-filter")
const dotenv = require("dotenv")

const { checkJwt } = require("./middleware/jwt")
const { authErrors } = require("./middleware/auth-errors")

dotenv.config()

const graphqlRoute = process.env.GRAPHQL_ROUTE || "/graphql"
const graphiqlRoute = process.env.GRAPHIQL_ROUTE || "/graphiql"
const issuer = process.env.AUTH0_DOMAIN
const audience = process.env.AUTH0_AUDIENCE
const isProduction = process.env.ENVIRONMENT === "production"

const app = express()

// Allow all CORS requests
app.use(cors())

app.use(graphqlRoute, async (req, res, next) => {
  if (!isProduction && req.headers.x_user_id) {
    req.auth = { sub: req.headers.x_user_id }
  } else {
    await checkJwt({ issuer, audience })(req, res, () => {
      authErrors(req, res, next)
    })
  }
  next()
})

const pluginHook = makePluginHook([PgPubsub])

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
      pgSettings: (req) => {
        const settings = {}
        if (req.auth) {
          settings["user.provider_id"] = req.auth.sub
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
