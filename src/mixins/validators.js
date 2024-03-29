const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

export default {
    data() {
        return {
            matchesPassword: value => (value === this.password) || 'Kindly ensure the passwords match',
            required: value => ((value !== undefined) && (value !== null) && (value !== '')) || 'This field is required',
            nonEmpty: value => (value.length > 0) || 'This field requires at least one value',
            isEmail: value => /.+@.+\..+/.test(value) || 'This email is invalid',
            isPhoneNumber: value => this.isValidPhoneNumber(value) || 'This phone number is invalid for this region',
            min: min => {
                return value => (value >= min) || `The min value is ${min}`;
            },
            max: max => {
                return value => (value <= max) || `The max value is ${max}`;
            }
        };
    },
    methods: {
        isValidPhoneNumber(phoneNumber) {
            try {
                const number = phoneUtil.parseAndKeepRawInput(phoneNumber, this.phoneNumber.countryCode);
        
                return phoneUtil.isValidNumberForRegion(number, this.phoneNumber.countryCode);
            } catch (error) {
                return false;
            }
        },
        formatAsE164PhoneNumber(phoneNumber) {
            if (this.isValidPhoneNumber(phoneNumber)) {
                const number = phoneUtil.parseAndKeepRawInput(phoneNumber, this.phoneNumber.countryCode);
                const contactPhone = phoneUtil.format(number, PNF.E164);

                return contactPhone;
            }

            return phoneNumber;
        },
    }
};