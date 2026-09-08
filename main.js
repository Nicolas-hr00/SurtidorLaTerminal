const SUPABASE_URL = 'https://zbbtiqjvgpcsguahrqxc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiYnRpcWp2Z3Bjc2d1YWhycXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3OTk5MDAsImV4cCI6MjEwMTM3NTkwMH0.8rGVAZiXOIiJqtkUc4ek7MFFnLpSY7JxZmzxBOqAaIE';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);



// ================================================= Currency and Percentage =================================================
function formatCurrency(value) {
  return 'Bs ' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function formatPercent(value) {
  return value.toFixed(1) + '%';
}
// ================================================= ==================================================================================================


// ================================================= Connecting to the Database =================================================
async function loadSettings() { 
    const {data, error} = await supabaseClient
    .from('settings') //settings is the name of the database 
    .select('*') //we are selecting everyting from the table 
    .order('updated_at', {ascending:false}) 
    .limit(1)
    .maybeSingle()
  if (error || !data) {
    alert('Supabase error: ' + (error ? error.message : 'no data returned')); //throwing an error message in case it fails to connect 
  return null;
}
    return { //these are the variables withing the database table 
       priceGasoline: Number(data.price_gasoline),
       efficiencyGasoline: Number(data.efficiency_gasoline),
       priceGnv: Number (data.price_gnv),
       efficiencyGnv: Number(data.efficiency_gnv),
       conversionCost: Number(data.conversion_cost),
    };
}

// ================================================= End Of the connecting data base  =================================================


// ================================================= Making the calculations for the results =================================================
function calculate(amount, calculationType, config) {
  const gasolinaMensual = calculationType === 'liters' ? amount * config.priceGasoline : (amount / config.efficiencyGasoline) * config.priceGasoline;
  const gnvMensual = calculationType === 'liters' ? amount * config.priceGnv : (amount / config.efficiencyGnv) * config.priceGnv;
  const ahorroMensual = gasolinaMensual - gnvMensual;
  const ahorroAnual = ahorroMensual * 12;
  const porcentajeAhorro = gasolinaMensual ? (ahorroMensual / gasolinaMensual) * 100 : 0;
  const mesesRecuperacion = ahorroMensual > 0 ? config.conversionCost / ahorroMensual : Infinity;


    return {
        gasolinaMensual,
        gnvMensual,
        ahorroMensual,
        ahorroAnual, 
        porcentajeAhorro, 
        mesesRecuperacion,
    };
}
//================================================= End of calculations =================================================\

// ================================================= storing the results =================================================
function renderResults(results) {
  document.getElementById('gasolina-mensual').textContent = formatCurrency(results.gasolinaMensual);

  document.getElementById('gnv-mensual').textContent = formatCurrency(results.gnvMensual);

  document.getElementById('ahorro-mensual').textContent = formatCurrency(results.ahorroMensual);

  document.getElementById('ahorro-anual').textContent =  formatCurrency(results.ahorroAnual);

  document.getElementById('porcentaje-ahorro').textContent = formatPercent(results.porcentajeAhorro);
    
  document.getElementById('meses-recuperacion').textContent =
    (isFinite(results.mesesRecuperacion) ? results.mesesRecuperacion.toFixed(1) : '—');
  
  }
// ================================================= END storing the results =================================================

// ================================================= From KM to Liters UI perspective =================================================
function updateInputLabels() {
  const calculationType = document.getElementById('calculation-type').value;
  const isLiters = calculationType === 'liters';
  document.getElementById('amount-label').textContent = isLiters ? 'Litros mensuales' : 'Kilómetros mensuales';
  document.getElementById('amount-unit').textContent = isLiters ? 'L' : 'km';
  document.getElementById('amount').placeholder = isLiters ? 'ejemplo: 300' : 'ejemplo: 5000';
}


    async function handleCalculate(event) {
      if(event) event.preventDefault();


       const calculationType = document.getElementById('calculation-type').value;
       const amount = Number(document.getElementById('amount').value);

        if (!amount || amount <= 0) {
          alert(calculationType === 'liters' ? 'Ingresa un valor válido de litros.' : 'Ingresa un valor válido de kilómetros.');
            return;
        }

        const config = await loadSettings();
        if(!config) {
            alert('No se pudo cargar la cofiguracion.')
            return;
        }

        const results = calculate(amount, calculationType, config);
        renderResults(results);
    }


    document.getElementById('calculation-type').addEventListener('change', updateInputLabels);
    document.getElementById('calculator-form').addEventListener('submit', handleCalculate);
    updateInputLabels();