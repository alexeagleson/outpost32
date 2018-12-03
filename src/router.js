import Vue from "vue";
import Router from "vue-router";
import LoginRegister from "@/components/LoginRegister";
import Logout from "@/components/Logout";
import Intro from "@/components/Intro";
import Outpost from "@/components/Outpost";

let router = new Router({
  mode: "history",
  routes: [
    {
      path: "/intro",
      name: "intro",
      component: Intro,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: "/",
      name: "login",
      component: LoginRegister,
      meta: {
        guest: true
      },
      props: {
        formType: "login"
      }
    },
    {
      path: "/register",
      name: "register",
      component: LoginRegister,
      meta: {
        guest: true
      },
      props: {
        formType: "register"
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
      path: "/outpost",
      name: "outpost",
      component: Outpost,
      meta: {
        requiresAuth: true
      }
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (localStorage.getItem("outpostJwt") == null) {
      next({
        path: "/",
        params: { nextUrl: to.fullPath }
      });
    } else {
      next();
    }
  } else if (to.matched.some(record => record.name === "logout")) {
    next();
  } else if (to.matched.some(record => record.meta.guest)) {
    if (localStorage.getItem("outpostJwt") == null) {
      next();
    } else {
      next({ name: "intro" });
    }
  } else {
    next();
  }
});

Vue.use(Router);

export default router;
