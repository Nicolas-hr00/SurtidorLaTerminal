const SUPABASE_URL = 'https://zbbtiqjvgpcsguahrqxc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiYnRpcWp2Z3Bjc2d1YWhycXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3OTk5MDAsImV4cCI6MjEwMTM3NTkwMH0.8rGVAZiXOIiJqtkUc4ek7MFFnLpSY7JxZmzxBOqAaIE';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// const currencyFormatter = new Intl.NumberFormat("es-BO", {
//     style: "currency",
//     currency: "BOB"
// });

function formatCurrency(value) {
  return 'Bs ' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function formatPercent(value) {
  return value.toFixed(1) + '%';
}

async function loadSettings() {
    const {data, error} = await supabaseClient
    .from('settings')
    .select('*')
    .order('updated_at', {ascending:false})
    .limit(1)
    .maybeSingle()
  if (error || !data) {
    alert('Supabase error: ' + (error ? error.message : 'no data returned'));
  return null;
}
    return {
       priceGasoline: Number(data.price_gasoline),
       efficiencyGasoline: Number(data.efficiency_gasoline),
       priceGnv: Number (data.price_gnv),
       efficiencyGnv: Number(data.efficiency_gnv),
       conversionCost: Number(data.conversion_cost),
    };
}

function calculate(km, config) {
  const gasolinaMensual = (km / config.efficiencyGasoline) * config.priceGasoline;
  const gnvMensual = (km / config.efficiencyGnv) * config.priceGnv;
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
function renderResults(results) {
  document.getElementById('gasolina-mensual').textContent = formatCurrency(results.gasolinaMensual);

  document.getElementById('gnv-mensual').textContent = formatCurrency(results.gnvMensual);

  document.getElementById('ahorro-mensual').textContent = formatCurrency(results.ahorroMensual);

  document.getElementById('ahorro-anual').textContent =  formatCurrency(results.ahorroAnual);

  document.getElementById('porcentaje-ahorro').textContent = formatCurrency(results.porcentajeAhorro) + '%';
    
  document.getElementById('meses-recuperacion').textContent =
    (isFinite(results.mesesRecuperacion) ? results.mesesRecuperacion.toFixed(1) : '—');
    }

    async function handleCalculate() {
        const km = Number(document.getElementById('km').value);

        if (!km || km <= 0) {
            alert ('Ingresa un valor valido de kilometros.')
            return;
        }

        const config = await loadSettings();
        if(!config) {
            alert('No se pudo cargar la cofiguracion.')
            return;
        }

        const results = calculate(km,config);
        renderResults(results);
    }