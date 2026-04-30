// ==========================================
// 1. LOGIKA HAMBURGER MENU MOBILE
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const mobileNavLinks = document.querySelectorAll('.nav-link-mobile');
    
    let isMobileMenuOpen = false;

    function toggleMenu() {
        isMobileMenuOpen = !isMobileMenuOpen;
        if (isMobileMenuOpen) {
            mobileMenu.classList.remove('hidden');
            mobileMenu.classList.add('flex');
            menuIcon.classList.remove('fa-bars');
            menuIcon.classList.add('fa-xmark');
        } else {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('flex');
            menuIcon.classList.remove('fa-xmark');
            menuIcon.classList.add('fa-bars');
        }
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMenu);
    }

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (isMobileMenuOpen) toggleMenu();
        });
    });
});

// ==========================================
// 2. SPA NAVIGATION & TOAST
// ==========================================
function showToast(message, isError = false) {
    const toast = document.getElementById("toast");
    const toastMsg = document.getElementById("toastMessage");
    toastMsg.innerText = message;
    
    if(isError) {
        toast.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-red-500 text-lg"></i> <div class="flex-1 text-left">${message}</div>`;
        toast.style.borderColor = "rgba(239, 68, 68, 0.5)"; 
    } else {
        toast.innerHTML = `<i class="fa-solid fa-circle-check text-[#11caa0] text-lg"></i> <div class="flex-1 text-left">${message}</div>`;
        toast.style.borderColor = "rgba(17, 202, 160, 0.3)"; 
    }
    toast.className = "show";
    setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
}

function showPage(pageId) {
    document.querySelectorAll('.page-wrapper').forEach(page => { page.classList.remove('active-page'); });
    const targetPage = document.getElementById('page-' + pageId);
    if (targetPage) targetPage.classList.add('active-page');
    
    document.querySelectorAll('.nav-link').forEach(link => { link.classList.remove('active'); });
    const activeNav = document.getElementById('nav-' + pageId);
    if (activeNav) activeNav.classList.add('active');

    document.querySelectorAll('.nav-link-mobile').forEach(link => { link.classList.remove('active', 'text-[#11caa0]'); });
    const activeMobileNav = document.getElementById('nav-mobile-' + pageId);
    if (activeMobileNav) activeMobileNav.classList.add('active', 'text-[#11caa0]');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// 3. LOGIKA DATA & DROPDOWN
// ==========================================
let dataPoints = [];
let luasLahan = 1000;
let kebutuhanAir = 10; 

document.getElementById('inputLuas').addEventListener('input', (e) => { 
    if(e.target.value < 0) e.target.value = 0;
    luasLahan = Number(e.target.value); 
    updateUI(); 
});

document.getElementById('selectTanaman').addEventListener('change', (e) => {
    const val = e.target.value;
    const inputKebutuhan = document.getElementById('inputKebutuhan');
    if (val === 'custom') {
        inputKebutuhan.readOnly = false;
        inputKebutuhan.classList.remove('bg-slate-50', 'text-slate-500');
        inputKebutuhan.focus();
    } else {
        inputKebutuhan.value = val;
        inputKebutuhan.readOnly = true;
        inputKebutuhan.classList.add('bg-slate-50', 'text-slate-500');
        kebutuhanAir = Number(val);
        updateUI();
    }
    showToast("Konfigurasi diperbarui", false);
});

document.getElementById('inputKebutuhan').addEventListener('input', (e) => { 
    if(e.target.value < 0) e.target.value = 0;
    kebutuhanAir = Number(e.target.value); 
    updateUI(); 
});

// ==========================================
// 4. KONFIGURASI CHART.JS
// ==========================================
const ctx = document.getElementById('flowChart').getContext('2d');
let gradientFill = ctx.createLinearGradient(0, 0, 0, 400);
gradientFill.addColorStop(0, 'rgba(17, 202, 160, 0.4)');
gradientFill.addColorStop(1, 'rgba(17, 202, 160, 0.0)');

const isMobile = window.innerWidth < 768;

const flowChart = new Chart(ctx, {
    type: 'line',
    data: { 
        labels: [], 
        datasets: [{ 
            label: 'Laju Debit (L/mnt)', 
            data: [], 
            borderColor: '#11caa0', 
            fill: true, 
            backgroundColor: gradientFill, 
            tension: 0.4, 
            borderWidth: isMobile ? 2 : 3,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#11caa0',
            pointBorderWidth: 2,
            pointRadius: isMobile ? 3 : 4
        }] 
    },
    options: { 
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { 
            y: { beginAtZero: true, border: { display: false }, grid: { color: '#f1f5f9' }, ticks: { font: {size: isMobile ? 10 : 12} } },
            x: { border: { display: false }, grid: { display: false }, ticks: { font: {size: isMobile ? 10 : 12} } }
        }
    }
});

window.addEventListener('resize', () => {
    const mobileNow = window.innerWidth < 768;
    flowChart.options.scales.x.ticks.font.size = mobileNow ? 10 : 12;
    flowChart.options.scales.y.ticks.font.size = mobileNow ? 10 : 12;
    flowChart.data.datasets[0].borderWidth = mobileNow ? 2 : 3;
    flowChart.data.datasets[0].pointRadius = mobileNow ? 3 : 4;
    flowChart.update();
});

// ==========================================
// 5. KALKULUS & UPDATE UI
// ==========================================
function calculateIntegral() {
    if (dataPoints.length < 2) return 0;
    let total = 0;
    for (let i = 0; i < dataPoints.length - 1; i++) {
        let dt = dataPoints[i+1].time - dataPoints[i].time;
        let avg = (dataPoints[i].flow + dataPoints[i+1].flow) / 2;
        total += dt * avg;
    }
    return total;
}

function updateTable() {
    const tbody = document.getElementById('tableBody');
    const emptyMsg = document.getElementById('emptyTableMsg');
    tbody.innerHTML = '';

    if (dataPoints.length < 2) {
        emptyMsg.style.display = 'block';
        return;
    }

    emptyMsg.style.display = 'none';
    let rowsHTML = '';

    for (let i = 0; i < dataPoints.length - 1; i++) {
        let t1 = dataPoints[i].time;
        let t2 = dataPoints[i+1].time;
        let dt = t2 - t1;
        let f1 = dataPoints[i].flow;
        let f2 = dataPoints[i+1].flow;
        let avg = (f1 + f2) / 2;
        let area = dt * avg;

        rowsHTML += `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="p-4 font-bold text-slate-400">#${i+1}</td>
                <td class="p-4">${t1} &rightarrow; ${t2}</td>
                <td class="p-4 font-bold text-blue-600">${dt}</td>
                <td class="p-4">${f1} &rightarrow; ${f2}</td>
                <td class="p-4 font-bold text-orange-500">${avg.toFixed(1)}</td>
                <td class="p-4 text-right font-black text-[#11caa0]">+${area.toFixed(2)}</td>
            </tr>
        `;
    }
    tbody.innerHTML = rowsHTML;
}

function updateUI() {
    const current = calculateIntegral();
    const target = luasLahan * kebutuhanAir;
    
    document.getElementById('cardVolume').innerText = current.toLocaleString('id-ID');
    let percent = target > 0 ? (current / target) * 100 : 0;
    document.getElementById('cardPercent').innerText = `${percent.toFixed(1)}%`;
    document.getElementById('progressBar').style.width = `${Math.min(percent, 100)}%`;
    
    flowChart.data.labels = dataPoints.map(d => `${d.time}m`);
    flowChart.data.datasets[0].data = dataPoints.map(d => d.flow);
    flowChart.update();

    updateTable();
}

// ==========================================
// 6. VALIDASI INPUT & AKSI TOMBOL
// ==========================================
document.getElementById('formDebit').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const inputWaktuElem = document.getElementById('inputWaktu');
    const inputDebitElem = document.getElementById('inputDebit');
    
    const time = Number(inputWaktuElem.value);
    const flow = Number(inputDebitElem.value);
    
    if (time < 0 || flow < 0) {
        showToast("Data tidak boleh bernilai minus!", true);
        inputWaktuElem.classList.add('input-error');
        inputDebitElem.classList.add('input-error');
        setTimeout(() => {
            inputWaktuElem.classList.remove('input-error');
            inputDebitElem.classList.remove('input-error');
        }, 1000);
        return; 
    }

    const isDuplicate = dataPoints.some(d => d.time === time);
    if (isDuplicate) {
        showToast(`Data menit ke-${time} sudah ada!`, true);
        inputWaktuElem.classList.add('input-error');
        setTimeout(() => inputWaktuElem.classList.remove('input-error'), 1000);
        return; 
    }
    
    dataPoints.push({ time, flow });
    dataPoints.sort((a,b) => a.time - b.time);
    
    updateUI();
    showToast(`Tercatat: Waktu ${time}m, Laju ${flow}L/m`, false);
    
    inputWaktuElem.value = dataPoints[dataPoints.length - 1].time + 10;
    inputDebitElem.value = '';
    inputDebitElem.focus();
});

function resetData() {
    if(dataPoints.length > 0 && confirm("Reset semua data simulasi?")) {
        dataPoints = [];
        updateUI();
        document.getElementById('inputWaktu').value = 0;
        document.getElementById('inputDebit').value = '';
        showToast("Sistem direset", false);
    }
}

function downloadExcel() {
    if(dataPoints.length < 2) return showToast("Butuh min. 2 data untuk validasi!", true);
    let csv = "Segmen,Waktu Awal,Waktu Akhir,Delta T (mnt),Debit Awal,Debit Akhir,Rata-rata Debit,Volume Segmen (L)\n";
    for (let i = 0; i < dataPoints.length - 1; i++) {
        let dt = dataPoints[i+1].time - dataPoints[i].time;
        let avg = (dataPoints[i].flow + dataPoints[i+1].flow) / 2;
        let area = dt * avg;
        csv += `${i+1},${dataPoints[i].time},${dataPoints[i+1].time},${dt},${dataPoints[i].flow},${dataPoints[i+1].flow},${avg.toFixed(1)},${area.toFixed(2)}\n`;
    }
    csv += `\nTotal Volume Kalkulus,,,${calculateIntegral().toFixed(2)} L`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'Laporan_Validasi_HydroLogic.csv');
    a.click();
    showToast("Tabel Laporan Diunduh", false);
}

// Inisialisasi awal
document.getElementById('inputWaktu').value = 0;
updateUI();