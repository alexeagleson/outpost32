import Vue from 'vue';
import Router from 'vue-router';
import Admin from '@/components/Admin';
import LoginRegister from '@/components/LoginRegister';
import Logout from '@/components/Logout';
import Intro from '@/components/Intro';
import Outpost from '@/components/Outpost';

let router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/intro',
      name: 'intro',
      component: Intro,
      meta: {
        requiresUser: true,
      },
    },
    {
      path: '/',
      name: 'login',
      component: LoginRegister,
      props: {
        formType: 'login',
      },
    },
    {
      path: '/register',
      name: 'register',
      component: LoginRegister,
      props: {
        formType: 'register',
      },
    },
    {
      path: '/admin',
      name: 'admin',
      component: Admin,
      meta: {
        requiresUser: true,
        requiresAdmin: true,
      },
    },
    {
      path: '/logout',
      name: 'logout',
      component: Logout,
    },
    {
      path: '/outpost',
      name: 'outpost',
      component: Outpost,
      meta: {
        requiresUser: true,
      },
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (localStorage.getItem('userAdmin') === 'false') {
      next({
        path: '/intro',
        params: { nextUrl: to.fullPath },
      });
    } else {
      next();
    }
  } else if (to.matched.some(record => record.meta.requiresAuth)) {
    if (localStorage.getItem('userJwt') === null) {
      next({
        path: '/',
        params: { nextUrl: to.fullPath },
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

Vue.use(Router);

export default router;
