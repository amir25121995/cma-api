module.exports = {
  clients: {
    table: 'client_details',
    fields: [
      'company_name', 'billing_address', 'contact_person', 'contact_email',
      'finance_email', 'ops_email', 'contact_no', 'status_of_collab', 'remarks'
    ],
    required: [
      'company_name', 'billing_address', 'contact_person', 'contact_email',
      'finance_email', 'ops_email', 'contact_no', 'status_of_collab'
    ],
    emailFields: ['contact_email', 'finance_email', 'ops_email']
  },
  cases: {
    table: 'case_details',
    fields: [
      'case_ref_no', 'date_of_assistance', 'country', 'city', 'patient_name',
      'insurance', 'ic_ref_no', 'hospital_doctors', 'invoice_status',
      'service_type', 'final_invoice', 'mr_status', 'remarks'
    ],
    required: [
      'case_ref_no', 'country', 'city', 'patient_name', 'insurance', 'ic_ref_no',
      'hospital_doctors', 'invoice_status', 'service_type', 'mr_status'
    ],
    emailFields: []
  },
  hospitals: {
    table: 'hospital_details',
    fields: [
      'hospital_name', 'location_city', 'country', 'ops_email', 'phone_no',
      'contact_person', 'admin_email', 'branches', 'contact_no',
      'mode_of_payment', 'remarks'
    ],
    required: [
      'hospital_name', 'location_city', 'country', 'ops_email', 'phone_no',
      'contact_person', 'admin_email', 'branches', 'contact_no', 'mode_of_payment'
    ],
    emailFields: ['ops_email', 'admin_email']
  },
  providers: {
    table: 'provider_details',
    fields: [
      'provider_name', 'regions_covered', 'service_type', 'case_fee',
      'contact_person', 'contact_no', 'contact_email', 'ops_email',
      'finance_email', 'remarks'
    ],
    required: [
      'provider_name', 'regions_covered', 'service_type', 'case_fee',
      'contact_person', 'contact_no', 'contact_email', 'ops_email', 'finance_email'
    ],
    emailFields: ['contact_email', 'ops_email', 'finance_email']
  }
};
