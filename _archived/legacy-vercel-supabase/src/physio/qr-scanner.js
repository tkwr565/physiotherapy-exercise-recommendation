import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '../shared/supabase.js';
import { isValidUUID } from '../shared/utils.js';

let scanner = null;

/**
 * Render QR scanner page
 */
export function renderScannerPage() {
  return `
    <div class="scanner-container">
      <h2 style="text-align: center; margin-bottom: 20px;">Scan Patient QR Code</h2>
      <p style="text-align: center; color: var(--text-light); margin-bottom: 30px;">
        Position the patient's QR code within the camera frame
      </p>

      <div id="qr-reader"></div>

      <div class="manual-entry">
        <h3 style="margin-bottom: 15px;">Manual Entry</h3>
        <p style="color: var(--text-light); margin-bottom: 15px;">
          If the QR code doesn't scan, you can enter the UUID manually:
        </p>

        <form id="manualUuidForm">
          <div style="display: flex; gap: 10px;">
            <input
              type="text"
              id="manualUuid"
              placeholder="Enter UUID (e.g., 550e8400-e29b-41d4-a716-446655440000)"
              style="flex: 1;"
            >
            <button type="submit" class="btn btn-primary">
              Load Patient
            </button>
          </div>
        </form>

        <div id="scanError" class="error-message hidden"></div>
      </div>
    </div>
  `;
}

/**
 * Initialize QR scanner
 */
export function initScanner(onSuccess) {
  const config = {
    fps: 10,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0
  };

  scanner = new Html5QrcodeScanner("qr-reader", config, false);

  scanner.render(
    (decodedText) => {
      // Success callback
      handleScannedUUID(decodedText, onSuccess);
    },
    (error) => {
      // Error callback (scanning errors - ignore these)
      // console.warn('QR scan error:', error);
    }
  );

  // Setup manual entry form
  setupManualEntryForm(onSuccess);
}

/**
 * Handle scanned UUID
 */
async function handleScannedUUID(uuid, onSuccess) {
  const errorDiv = document.getElementById('scanError');

  // Validate UUID format
  if (!isValidUUID(uuid)) {
    errorDiv.textContent = 'Invalid UUID format. Please try again.';
    errorDiv.classList.remove('hidden');
    return;
  }

  // Stop scanner
  if (scanner) {
    await scanner.clear();
  }

  // Check if UUID exists in database
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', uuid)
      .single();

    if (error || !data) {
      errorDiv.textContent = 'Patient not found. Please verify the QR code and try again.';
      errorDiv.classList.remove('hidden');

      // Restart scanner
      setTimeout(() => {
        initScanner(onSuccess);
      }, 3000);
      return;
    }

    // Success - patient found
    errorDiv.classList.add('hidden');
    onSuccess(uuid, data);

  } catch (error) {
    console.error('Database error:', error);
    errorDiv.textContent = 'Error loading patient data. Please try again.';
    errorDiv.classList.remove('hidden');
  }
}

/**
 * Setup manual entry form
 */
function setupManualEntryForm(onSuccess) {
  const form = document.getElementById('manualUuidForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const uuid = document.getElementById('manualUuid').value.trim();
    await handleScannedUUID(uuid, onSuccess);
  });
}

/**
 * Cleanup scanner
 */
export async function cleanupScanner() {
  if (scanner) {
    try {
      await scanner.clear();
      scanner = null;
    } catch (error) {
      console.error('Error cleaning up scanner:', error);
    }
  }
}
