<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';


const model = ref([
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/dashboard' }]
    },
    {
        label: 'CRUD',
        items: [
            {
                label: 'Kehadiran',
                icon: 'pi pi-fw pi-table',
                to: '/dashboard/kehadiran'
            },
            {
                label: 'Undangan',
                icon: 'pi pi-fw pi-pencil',
                to: '/dashboard/undangan'
            }
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="i">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
