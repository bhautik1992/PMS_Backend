export const validateUniqueBankDetails = async (existingRecord, newRecord) => {
    let errorMessage = "";

    if (existingRecord) {
        console.log(existingRecord.account_number);
        console.log(existingRecord);

        if (existingRecord.account_number === newRecord?.account_number?.trim()) {
            errorMessage = 'Account Number is already exists.';
        } else if (existingRecord.aadhar_card === newRecord?.aadhar_card?.trim()) {
            errorMessage = 'Aadhar Card number is already exists.';
        } else if (existingRecord.pan_card === newRecord?.pan_card?.trim()) {
            errorMessage = 'PAN Card number is already exists.';
        }
    }

    return errorMessage;
}


