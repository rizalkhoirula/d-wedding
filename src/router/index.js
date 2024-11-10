import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';
// import { isAuthenticated } from '@/views/pages/auth/session.js';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        
        {
            path: '/',
            children: [
                {
                    path: '/auth/login',
                    name: 'login',
                    component: () => import('@/views/pages/auth/Login.vue')
                },
                {
                    path: '/auth/register',
                    name: 'register',
                    component: () => import('@/views/pages/auth/Register.vue')
                }
            ]
        },
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/dashboard',
                    name: 'dashboard',
                    component: () => import('@/views/pages/Dashboard.vue'),
                    // beforeEnter: (to, from, next) => {
                    //     if (isAuthenticated()) {
                    //         next();
                    //     } else {
                    //         alert('Login First');
                    //         next('auth/login');
                    //     }
                    // }
                },
                {
                    path: '/dashboard/undangan',
                    name: 'undangan',
                    component: () => import('@/views/pages/undangan.vue')
                },
                {
                    path: '/dashboard/kehadiran',
                    name: 'kehadiran',
                    component: () => import('@/views/pages/kehadiran.vue')
                }
            ]
        }
    ]
});

export default router;
