// Native fetch in Node 18+
async function debugPolicy() {
    try {
        const res = await fetch('http://localhost:3001/api/policy');
        const data = await res.json();
        console.log("Full Policy Keys:", Object.keys(data));
        console.log("Policy Borrowing Type:", typeof data.policy_borrowing);
        if (typeof data.policy_borrowing === 'string') {
            console.log("Policy Borrowing (String):", data.policy_borrowing);
        } else {
            console.log("Policy Borrowing (Obj):", JSON.stringify(data.policy_borrowing, null, 2));
        }
    } catch (e) {
        console.error(e);
    }
}

debugPolicy();
