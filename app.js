const config = window.COUNTRY_PAWS_CONFIG || {};

const hasSupabase = Boolean(
  config.supabaseUrl &&
  config.supabaseAnonKey &&
  !config.supabaseUrl.includes('your-project') &&
  !config.supabaseAnonKey.includes('YOUR_SUPABASE')
);

const db = hasSupabase ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey) : null;

const services = [
  { id: 'full-groom', name: 'Full Groom', description: 'Bath, cut, drying and styling tailored to their coat.' },
  { id: 'bath-brush', name: 'Bath & Brush', description: 'A refreshing wash, blow-dry and thorough brush-out.' },
  { id: 'nail-trim', name: 'Nail Trim', description: 'Quick, calm nail care for nervous paws too.' },
  { id: 'de-shedding', name: 'De-shedding', description: 'Extra coat care for seasonal undercoat buildup.' },
  { id: 'senior-care', name: 'Senior Dog Care', description: 'Patient sessions designed around older dogs.' },
  { id: 'gentle-handling', name: 'Gentle Handling', description: 'A calm approach for sensitive and first-time pups.' }
];

const reviews = [
  { name: 'Sydni D.B.', text: 'Every single visit, my dog comes back looking like a brand-new puppy.' },
  { name: 'Heather G.', text: 'I love the professionalism and how patient Melissa is with my nervous dog.' },
  { name: 'Kimberly B.F.', text: 'My rescue was matted and meand as could be — nobody else would touch her. Melissa cleaned her up head to toe.' },
  { name: 'Andrea V.B.', text: 'A clean, welcoming space. I now bring both of my dogs here regularly.' },
  { name: 'Kristen B.', text: 'My senior German Shepherd was treated patiently and with real care.' },
  { name: 'Michelle O.H.', text: 'My first visit for all three dogs—and they all looked adorable.' }
];

const $ = (selector) => document.querySelector(selector);

$('#service-list').innerHTML = services
  .map((service, index) => `
    <article class="service-card">
      <span class="service-number">0${index + 1}</span>
      <h3>${service.name}</h3>
      <p>${service.description}</p>
    </article>
  `)
  .join('');

$('#service-picker').innerHTML = services
  .map((service, index) => `
    <button
      type="button"
      class="service-option${index === 0 ? ' active' : ''}"
      data-service="${service.id}"
    >
      ${service.name}
    </button>
  `)
  .join('');

$('#review-list').innerHTML = reviews
  .map((review) => `
    <article class="review-card">
      <p>“${review.text}”</p>
      <strong>${review.name}</strong>
    </article>
  `)
  .join('');

let selectedService = services[0].id;

const dateInput = $('#booking-date');
const timeSelect = $('#booking-time');

if (dateInput) {
  dateInput.min = new Date().toISOString().slice(0, 10);
}

async function loadTimes() {
  if (!dateInput || !timeSelect) return;

  const date = dateInput.value;
  if (!date) {
    timeSelect.innerHTML = '<option value="">Select a date first</option>';
    return;
  }

  timeSelect.innerHTML = '<option>Loading times…</option>';

  const fallbackSlots = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30'];
  let slots = fallbackSlots;

  if (db) {
    try {
      const { data, error } = await db
        .from('availability')
        .select('start_time, end_time')
        .eq('date', date)
        .eq('is_available', true)
        .order('start_time');

      if (!error && data && data.length) {
        slots = data.map((slot) => slot.start_time.slice(0, 5));
      }
    } catch (error) {
      console.warn('Availability fetch failed, using demo slots.', error);
    }
  }

  timeSelect.innerHTML = slots
    .map((slot) => `<option value="${slot}">${slot}</option>`)
    .join('');
}

document.querySelectorAll('.service-option').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.service-option').forEach((option) => option.classList.remove('active'));
    button.classList.add('active');
    selectedService = button.dataset.service;
  });
});

if (dateInput) {
  dateInput.addEventListener('change', loadTimes);
}

$('#booking-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const messageBox = $('#booking-message');

  if (!db) {
    messageBox.textContent = 'Preview mode: add your Supabase publishable key in config.js to enable live booking.';
    messageBox.style.color = '#a56d00';
    return;
  }

  const payload = {
    service_id: selectedService,
    appointment_date: dateInput.value,
    start_time: timeSelect.value,
    customer_name: $('#customer-name').value,
    customer_email: $('#customer-email').value,
    customer_phone: $('#customer-phone').value,
    dog_name: $('#dog-name').value,
    notes: $('#booking-notes').value,
    status: 'requested'
  };

  try {
    const { error } = await db.from('appointments').insert(payload);

    if (error) {
      throw error;
    }

    messageBox.textContent = 'Request received — Melissa will confirm your appointment shortly.';
    messageBox.style.color = '#1d7a52';
    event.target.reset();
    loadTimes();
  } catch (error) {
    console.error(error);
    messageBox.textContent = 'We could not save that request. Please call or text us directly.';
    messageBox.style.color = '#b72b2b';
  }
});

$('#menu-button').addEventListener('click', () => {
  const nav = $('#mobile-nav');
  nav.classList.toggle('open');
  const expanded = nav.classList.contains('open');
  $('#menu-button').setAttribute('aria-expanded', String(expanded));
});
