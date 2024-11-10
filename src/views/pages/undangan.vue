<script setup>
import { ref, onMounted, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx'; // Import for Excel export

const toast = useToast();
const rsvp = ref({
    name: '',
    email: '',
    ucapan: '',
    status: '',
    Jumlahtamu: 0,
});
const rsvpList = ref([]);
const deleteRsvpDialog = ref(false);
const selectedRsvps = ref(null);
const filters = ref({});

onBeforeMount(() => {
    initFilters();
});

onMounted(async () => {
    try {
        const response = await axios.get('https://apiinvit.vercel.app/api/undangan');
        rsvpList.value = response.data;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch RSVP data', life: 3000 });
    }
});

const initFilters = () => {
    filters.value = {
        global: { value: null }
    };
};

const confirmDeleteRsvp = (rsvpData) => {
    rsvp.value = rsvpData;
    deleteRsvpDialog.value = true;
};

const deleteRsvp = async () => {
    try {
        const rsvpId = rsvp.value._id;
        await axios.delete(`https://apiinvit.vercel.app/api/undangan/${rsvpId}`);
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Invitation Deleted', life: 1000 });
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete Invitation', life: 3000 });
    } finally {
        deleteRsvpDialog.value = false;
        rsvp.value = {};
    }
};

// Export to PDF Function
const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Invitation Data', 14, 10);

    const data = rsvpList.value.map(rsvp => [
        rsvp.name,
        rsvp.email,
        rsvp.ucapan,
        rsvp.status,
        rsvp.Jumlahtamu,
    ]);

    const headers = ['Name', 'Email', 'Ucapan', 'Status', 'Jumlah Tamu'];

    doc.autoTable({
        head: [headers],
        body: data,
        startY: 20,
    });

    doc.save('invitations.pdf');

    toast.add({ severity: 'success', summary: 'Exported to PDF', detail: 'PDF Export Successful', life: 3000 });
};

// Export to Excel Function
const exportToExcel = () => {
    const data = rsvpList.value.map(rsvp => ({
        Name: rsvp.name,
        Email: rsvp.email,
        Ucapan: rsvp.ucapan,
        Status: rsvp.status,
        'Jumlah Tamu': rsvp.Jumlahtamu,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'RSVP Data');
    XLSX.writeFile(wb, 'invitations.xlsx');

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
                    :value="rsvpList"
                    v-model:selection="selectedRsvps"
                    dataKey="_id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Invitations"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Manage Invitations</h5>
                            <InputText class="w-full sm:w-auto" v-model="filters['global'].value" placeholder="Search..." />
                        </div>
                    </template>

                    <Column field="name" header="Name" :sortable="true" headerStyle="width:20%;"></Column>
                    <Column field="email" header="Email" :sortable="true" headerStyle="width:20%;"></Column>
                    <Column field="ucapan" header="Ucapan" :sortable="true" headerStyle="width:30%;"></Column>
                    <Column field="status" header="Status" :sortable="true" headerStyle="width:10%;"></Column>
                    <Column field="Jumlahtamu" header="Jumlah Tamu" :sortable="true" headerStyle="width:10%;"></Column>
                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded @click="confirmDeleteRsvp(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="deleteRsvpDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="rsvp">Are you sure you want to delete <b>{{ rsvp.name }}</b>?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="deleteRsvpDialog = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="deleteRsvp" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Add any additional styles if necessary */
</style>
