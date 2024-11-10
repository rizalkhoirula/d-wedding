<script setup>
import { ref, onMounted, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx'; // Import for Excel export

const toast = useToast();
const attendance = ref({
    name: '',
    JamKehadiran: '', // Field for attendance time
});
const attendanceList = ref([]); // This will store the attendance data
const deleteAttendanceDialog = ref(false);
const selectedAttendances = ref(null);
const filters = ref({});

onBeforeMount(() => {
    initFilters();
});

onMounted(async () => {
    try {
        // Fetch attendance data from the backend
        const response = await axios.get('https://apiinvit.vercel.app/api/kehadiran'); // Adjust URL to your actual backend API
        attendanceList.value = response.data; // Backend should return an array of attendance objects
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch attendance data', life: 3000 });
    }
});

const initFilters = () => {
    filters.value = {
        global: { value: null }
    };
};

const confirmDeleteAttendance = (attendanceData) => {
    attendance.value = attendanceData;
    deleteAttendanceDialog.value = true;
};

const deleteAttendance = async () => {
    try {
        const attendanceId = attendance.value._id;
        await axios.delete(`https://apiinvit.vercel.app/api/kehadiran/${attendanceId}`); // Adjust URL to your actual backend API
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Attendance Deleted', life: 1000 });
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete attendance', life: 3000 });
    } finally {
        deleteAttendanceDialog.value = false;
        attendance.value = {};
    }
};

// Function to format JamKehadiran to the desired format (HH:mm:ss yyyy-MM-dd)
const formatJamKehadiran = (date) => {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // months are zero-indexed
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds} ${year}-${month}-${day}`;
};

// Export to PDF Function
const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Attendance Data', 14, 10);

    // Map the attendance data to show name and formatted JamKehadiran
    const data = attendanceList.value.map(attendance => [
        attendance.name,
        formatJamKehadiran(attendance.JamKehadiran), // Format the date
    ]);

    const headers = ['Name', 'Attendance Time'];

    doc.autoTable({
        head: [headers],
        body: data,
        startY: 20,
    });

    doc.save('attendance.pdf');

    toast.add({ severity: 'success', summary: 'Exported to PDF', detail: 'PDF Export Successful', life: 3000 });
};

// Export to Excel Function
const exportToExcel = () => {
    const data = attendanceList.value.map(attendance => ({
        Name: attendance.name,
        'Attendance Time': formatJamKehadiran(attendance.JamKehadiran), // Format the date
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Data');
    XLSX.writeFile(wb, 'attendance.xlsx');

    toast.add({ severity: 'success', summary: 'Exported to Excel', detail: 'Excel Export Successful', life: 3000 });
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <!-- Export Buttons -->
                            <Button label="Export to PDF" icon="pi pi-file-pdf" class="mr-2" severity="primary" @click="exportToPDF" />
                            <Button label="Export to Excel" icon="pi pi-file-excel" severity="primary" @click="exportToExcel" />
                        </div>
                    </template>
                </Toolbar>

                <DataTable
                    :value="attendanceList"
                    v-model:selection="selectedAttendances"
                    dataKey="_id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Attendance"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Manage Attendance</h5>
                            <InputText class="w-full sm:w-auto" v-model="filters['global'].value" placeholder="Search..." />
                        </div>
                    </template>

                    <Column field="name" header="Name" :sortable="true" headerStyle="width:50%;"></Column>
                    <Column field="JamKehadiran" header="Attendance Time" :sortable="true" headerStyle="width:50%;" :body="formatJamKehadiran"></Column>

                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded @click="confirmDeleteAttendance(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="deleteAttendanceDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="attendance">Are you sure you want to delete <b>{{ attendance.name }}</b>?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="deleteAttendanceDialog = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="deleteAttendance" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Add any additional styles if necessary */
</style>
