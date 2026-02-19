/**
 * API Service Layer
 * Centralized API calls to the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Analyze VCF file with selected drugs
 * @param {File} file - VCF file
 * @param {string[]} drugs - Array of drug names
 * @param {string} patientId - Optional patient ID
 * @returns {Promise<Object>} Analysis results for the first drug (or array if multiple)
 */
export const analyzeVCF = async (file, drugs, patientId = 'unknown') => {
  if (!file) throw new Error('File is required');
  if (!drugs || drugs.length === 0) throw new Error('At least one drug is required');

  try {
    // If multiple drugs, analyze each one separately and combine results
    if (drugs.length > 1) {
      const results = await Promise.all(
        drugs.map(drug => analyzeSingleDrug(file, drug, patientId))
      );
      return results;
    } else {
      return await analyzeSingleDrug(file, drugs[0], patientId);
    }
  } catch (error) {
    console.error('VCF analysis error:', error);
    throw new Error(`Failed to analyze VCF: ${error.message}`);
  }
};

/**
 * Analyze a single drug
 * @private
 */
const analyzeSingleDrug = async (file, drug, patientId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('drug', drug);
  formData.append('patient_id', patientId);

  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

/**
 * Test VCF parsing (get detected variants)
 * @param {File} file - VCF file
 * @returns {Promise<Object>} Detected RSIDs
 */
export const testVCFParsing = async (file) => {
  if (!file) throw new Error('File is required');

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/test-vcf`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

/**
 * Analyze manual variant input
 * @param {Object} data - Manual variant data
 * @param {string} data.gene - Gene name
 * @param {string} data.phenotype - Phenotype
 * @param {string} data.drug - Drug name
 * @returns {Promise<Object>} Analysis result
 */
export const analyzeManualInput = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze-manual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Manual analysis error:', error);
    throw new Error(`Failed to analyze manual input: ${error.message}`);
  }
};

/**
 * Test API connectivity
 * @returns {Promise<Object>} Health check response
 */
export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Backend is not available at ${API_BASE_URL}`);
  }
};
