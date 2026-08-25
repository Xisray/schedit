import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  index("routes/home.tsx"),
  route("rooms", "routes/rooms.tsx"),
  route("groups", "routes/groups.tsx"),
] satisfies RouteConfig
