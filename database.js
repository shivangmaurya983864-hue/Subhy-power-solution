// ===============================
// Subhy Power Master Database
// ===============================

const DB_NAME = "SubhyPower_MasterDB";
const MASTER_PASSWORD = "123";


// ===============================
// Safe Database Loader
// ===============================
function getDB() {

    let db = JSON.parse(localStorage.getItem(DB_NAME));

    if (!db) {

        db = {
            billing: [],
            stock: [],
            customers: [],
            warranty: []
        };

        localStorage.setItem(DB_NAME, JSON.stringify(db));
    }

    return db;
}


// ===============================
// Save Data Function
// ===============================
function saveData(key, data) {

    let db = getDB();

    if (!db[key]) db[key] = [];

    // Duplicate Invoice Protection
    if (key === "billing" && data.invNo) {

        const exists = db.billing.some(
            bill => bill.invNo === data.invNo
        );

        if (exists) {

            alert("Invoice number already exists!");
            return false;

        }

        // Auto Stock Minus
        if (Array.isArray(data.items)) {

            data.items.forEach(item => {

                updateStockLevel(item.name, item.qty);

            });

        } else if (data.product && data.qty) {

            updateStockLevel(data.product, data.qty);

        }

        db = getDB();
    }

    db[key].push(data);

    localStorage.setItem(DB_NAME, JSON.stringify(db));

    localStorage.setItem(
        DB_NAME + "_emergency_backup",
        JSON.stringify(db)
    );

    console.log(`Saved in ${key}`);

    return true;
}


// ===============================
// Stock Update
// ===============================
function updateStockLevel(productName, quantitySold) {

    let db = getDB();

    if (!db.stock) return false;

    const index = db.stock.findIndex(item =>
        item.name.trim().toLowerCase() ===
        productName.trim().toLowerCase()
    );

    if (index === -1) {

        console.warn("Product not found:", productName);
        return false;

    }

    let current = parseInt(db.stock[index].qty) || 0;
    let sold = parseInt(quantitySold) || 0;

    if (current < sold) {

        alert(`Stock not enough for ${productName}`);
        return false;

    }

    db.stock[index].qty = current - sold;

    localStorage.setItem(DB_NAME, JSON.stringify(db));

    console.log(`Stock Updated ${productName} -${sold}`);

    return true;
}


// ===============================
// Secure Delete
// ===============================
function secureDelete(key, index) {

    const pass = prompt("Enter Admin Password");

    if (pass !== MASTER_PASSWORD) {

        alert("Wrong Password");
        return;

    }

    let db = getDB();

    if (db[key] && db[key][index]) {

        db[key].splice(index, 1);

        localStorage.setItem(DB_NAME, JSON.stringify(db));

        localStorage.setItem(
            DB_NAME + "_emergency_backup",
            JSON.stringify(db)
        );

        alert("Entry deleted");

        location.reload();
    }
}


// ===============================
// Backup Download
// ===============================
function downloadMasterBackup() {

    const data = localStorage.getItem(DB_NAME);

    if (!data) {

        alert("No data to backup");
        return;
    }

    const blob = new Blob([data], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    const date = new Date()
        .toLocaleDateString("en-IN")
        .replace(/\//g, "-");

    a.href = url;
    a.download = `SubhyPower_Backup_${date}.json`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}


// ===============================
// Database Initialization
// ===============================
window.addEventListener("load", () => {

    try {

        const mainDB = localStorage.getItem(DB_NAME);
        const backupDB = localStorage.getItem(DB_NAME + "_emergency_backup");

        if (!mainDB) {

            if (backupDB) {

                localStorage.setItem(DB_NAME, backupDB);

                console.log("Database recovered");

            } else {

                const init = {
                    billing: [],
                    stock: [],
                    customers: [],
                    warranty: []
                };

                localStorage.setItem(DB_NAME, JSON.stringify(init));

                console.log("Database initialized");

            }
        }

    } catch (e) {

        console.error("DB Error:", e);

    }

});