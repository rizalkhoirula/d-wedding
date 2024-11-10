<script setup>
import { onMounted, ref, watch } from 'vue';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const undangan = ref(null); // Invitations data
const kehadiran = ref(null); // Attendance data
const api = axios.create({
    baseURL: 'https://apiinvit.vercel.app/api/' // Sesuaikan dengan URL API Anda
});

// Fetch count of undangan (invitations)
const fetchUndangan = async () => {
    try {
        const response = await api.get('/undangan'); // Adjust to your actual API endpoint
        undangan.value = response.data.count; // Get the count of undangan (invitations)
        updateChart(); // Update chart after fetching data
    } catch (error) {
        console.error('Error fetching undangan:', error);
    }
};

// Fetch count of kehadiran (attendance)
const fetchKehadiran = async () => {
    try {
        const response = await api.get('/kehadiran'); // Adjust to your actual API endpoint
        kehadiran.value = response.data.count; // Get the count of kehadiran (attendance)
        updateChart(); // Update chart after fetching data
    } catch (error) {
        console.error('Error fetching kehadiran:', error);
    }
};

onMounted(() => {
    fetchUndangan();
    fetchKehadiran();
});

let lineChart = null;

const chartRef = ref(null);

const updateChart = () => {
    if (lineChart) {
        lineChart.data.datasets[0].data = [kehadiran.value, undangan.value];
        lineChart.update();
    }
};

const createChart = () => {
    const ctx = chartRef.value.getContext('2d');

    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Attendance', 'Invitations'],
            datasets: [
                {
                    label: 'Count',
                    data: [kehadiran.value, undangan.value],
                    backgroundColor: ['rgba(54, 162, 235, 0.2)', 'rgba(255, 99, 132, 0.2)'],
                    borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};

onMounted(() => {
    createChart();
});

const applyLightTheme = () => {};

const applyDarkTheme = () => {};

watch(
    () => true,
    (val) => {
        if (val) {
            applyDarkTheme();
        } else {
            applyLightTheme();
        }
    },
    { immediate: true }
);
</script>

<template>
    <div class="grid">
        <!-- Invitations Card -->
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Invitations</span>
                        <div class="text-900 font-medium text-xl">{{ undangan }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-envelope text-blue-500 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Attendance Card -->
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Attendance</span>
                        <div class="text-900 font-medium text-xl">{{ kehadiran }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-check text-orange-500 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Chart Section -->
    <div class="col-8 xl:col-12">
        <div class="card">
            <h5>Line Chart - Invitations vs Attendance</h5>
            <canvas ref="chartRef"></canvas>
        </div>
    </div>
</template>

<style scoped>
/* Add any additional styles if necessary */
</style>
