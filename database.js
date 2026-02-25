// Database Key & Global Configuration
const DB_NAME = "SubhyPower_MasterDB";
const MASTER_PASSWORD = "AK@1999"; // Portal password ke saath match kar diya

// 1. Data Save Karne Ka Function (With Safety Check)
function saveData(key, data) {
    let currentDB = JSON.parse(localStorage.getItem(DB_NAME)) || { billing: [], stock: [], customers: [], warranty: [] };
    
    // Safety Check: Check if Key exists in DB
    if (!currentDB[key]) {
        currentDB[key] = [];
    }

    // Duplicate Check: Agar Invoice hai toh check karo pehle se toh nahi hai
    if (key === 'billing' && data.invNo) {
        const exists = currentDB.billing.some(bill => bill.invNo === data.invNo);
        if (exists) {
            console.warn("⚠️ Duplicate Invoice Detected. Saving Skipped.");
            return false;
        }
    }
    
    // Naya data add karo
    currentDB[key].push(data);
    
    // LocalStorage mein save karo
    localStorage.setItem(DB_NAME, JSON.stringify(currentDB));
    
    // Auto-Backup: Browser ke ek aur safe corner mein copy
    localStorage.setItem(DB_NAME + "_emergency_backup", JSON.stringify(currentDB));
    
    console.log(`✅ Data saved in ${key} vault!`);
    return true;
}

// 2. Data Delete Karne Se Pehle Password Check (Secure Mode)
function secureDelete(key, index) {
    let pass = prompt("⚠️ WARNING: Yeh data hamesha ke liye mit jayega.\nMaster Password dalein:");
    
    if (pass === MASTER_PASSWORD) {
        let currentDB = JSON.parse(localStorage.getItem(DB_NAME));
        
        if (currentDB && currentDB[key]) {
            currentDB[key].splice(index, 1);
            localStorage.setItem(DB_NAME, JSON.stringify(currentDB));
            
            alert("✅ Deleted Successfully!");
            // Refresh logic: UI update ke liye reload zaruri hai agar dynamic table nahi use kar rahe
            location.reload(); 
        }
    } else if (pass !== null) { // Agar user 'Cancel' na dabaye tabhi galat password dikhao
        alert("❌ Galat Password! Data safe hai.");
    }
}

// 3. Ek Click Mein JSON Backup Download Karo
function downloadMasterBackup() {
    const data = localStorage.getItem(DB_NAME);
    if (!data) return alert("Kuch data hi nahi hai backup ke liye!");

    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SubhyPower_DB_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 4. Recovery System (Auto-Fix on Load)
window.onload = function() {
    // Agar main DB khali hai par backup mil gaya toh recover karo
    if (!localStorage.getItem(DB_NAME) || JSON.parse(localStorage.getItem(DB_NAME)).billing.length === 0) {
        let recoveryData = localStorage.getItem(DB_NAME + "_emergency_backup");
        if (recoveryData) {
            localStorage.setItem(DB_NAME, recoveryData);
            console.log("🚀 Data Recovered from Emergency Vault!");
            // Agar Dashboard page par ho toh UI update kar do
            if (typeof updateDashboard === "function") updateDashboard();
        }
    }
};