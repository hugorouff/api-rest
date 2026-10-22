process.stdin.on('data', (entreeUser) => {
    const montant = parseInt(entreeUser.toString().trim(), 10);

    if (isNaN(montant) || montant <= 0 || montant % 5 !== 0) {
        console.log("Montant invalide : la saisie doit être un multiple de 5.");
        process.exit();
    }

    let reste = montant;

    const nb20 = Math.floor(reste / 20);
    reste = reste % 20;

    const nb10 = Math.floor(reste / 10);
    reste = reste % 10;

    const nb5 = Math.floor(reste / 5);

    console.log("Distribution de " + montant + " euros :");
    console.log(nb20 + " billet(s) de 20 euros");
    console.log(nb10 + " billet(s) de 10 euros");
    console.log(nb5 + " billet(s) de 5 euros");

    process.exit();
});