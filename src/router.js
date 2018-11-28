import Vue from "vue";
import Router from "vue-router";
import Login from "@/components/Login";
import Logout from "@/components/Logout";
import Register from "@/components/Register";
import Example from "@/components/Example";
import Outpost from "@/components/Outpost";

let router = new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "login",
      component: Login,
      meta: {
        guest: true
      }
    },
    {
      path: "/logout",
      name: "logout",
      component: Logout,
      meta: {
        guest: true
      }
    },
    {
      path: "/register",
      name: "register",
      component: Register,
      meta: {
        guest: true
      }
    },
    {
      path: "/example",
      name: "example",
      component: Example,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: "/outpost",
      name: "outpost",
      component: Outpost,
      meta: {
        requiresAuth: true
      }
    },
  ]
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (localStorage.getItem("jwt") == null) {
      next({
        path: "/",
        params: { nextUrl: to.fullPath }
      });
    } else {
      next();
    }
  } else if (to.matched.some(record => record.name === 'logout')) {
    next();
  } else if (to.matched.some(record => record.meta.guest)) {
    if (localStorage.getItem("jwt") == null) {
      next();
    } else {
      next({ name: "example" });
    }
  } else {
    next();
  }
});

Vue.use(Router);

export default router;
