// Database Key
const DB_NAME = "SubhyPower_MasterDB";
const MASTER_PASSWORD = "SUBHY_ADMIN"; // Bhai tera password yahan hai

// 1. Data Save Karne Ka Function
function saveData(key, data) {
    let currentDB = JSON.parse(localStorage.getItem(DB_NAME)) || { billing: [], stock: [], customers: [], warranty: [] };
    
    // Naya data add karo
    if (currentDB[key]) {
        currentDB[key].push(data);
    }
    
    // LocalStorage mein save karo
    localStorage.setItem(DB_NAME, JSON.stringify(currentDB));
    
    // Auto-Backup: Browser ke ek aur safe corner (SessionStorage) mein bhi copy rakho
    sessionStorage.setItem(DB_NAME + "_backup", JSON.stringify(currentDB));
    console.log("Data Securly Saved in Vault!");
}

// 2. Data Delete Karne Se Pehle Password Check
function secureDelete(key, index) {
    let pass = prompt("⚠️ Warning: Data delete karne ke liye Master Password dalein:");
    
    if (pass === MASTER_PASSWORD) {
        let currentDB = JSON.parse(localStorage.getItem(DB_NAME));
        currentDB[key].splice(index, 1);
        localStorage.setItem(DB_NAME, JSON.stringify(currentDB));
        alert("✅ Data Deleted Successfully!");
        location.reload(); // Page refresh taki update dikhe
    } else {
        alert("❌ Galat Password! Data safe hai.");
    }
}

// 3. Ek Click Mein Poora Backup Download Karo (Excel ki tarah use kar sakte ho)
function downloadMasterBackup() {
    const data = localStorage.getItem(DB_NAME);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Subhy_Power_Backup_${new Date().toLocaleDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// 4. Recovery System (Agar browser crash ho jaye ya data udd jaye)
window.onload = function() {
    if (!localStorage.getItem(DB_NAME) && sessionStorage.getItem(DB_NAME + "_backup")) {
        let recoveryData = sessionStorage.getItem(DB_NAME + "_backup");
        localStorage.setItem(DB_NAME, recoveryData);
        console.log("🚀 Data Recovered from Backup!");
    }
};