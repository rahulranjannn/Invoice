import { SupplierDetails } from '../types';

const STORAGE_KEY = 'invoice_app_seller_profile';

const DEFAULT_PROFILE: SupplierDetails = {
    legal_name: 'Your Company Name',
    gstin: '29AAAAA0000A1Z5',
    address: 'Your Business Address',
    city: '',
    state_code: '',
    email: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    auth_signatory: ''
};

export const getSellerProfile = (): SupplierDetails => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Failed to load seller profile', e);
    }
    return DEFAULT_PROFILE;
};

export const saveSellerProfile = (profile: SupplierDetails) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
        console.error('Failed to save seller profile', e);
    }
};
