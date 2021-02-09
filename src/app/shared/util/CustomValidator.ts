import { AbstractControl, ValidatorFn } from '@angular/forms';

 export class CustomValidator {


    public static findCombinationLettersAndNumbers(): ValidatorFn {

        return (c: AbstractControl): { [key: string]: boolean } | null => {
            // console.log('val:', c.value);

            let isDigit = false;
            let isCapsOrSmallLetter = false;
            // let isSmallLetter = false;
            let isSpecialChar = false;
            if ((!/\d/.test(c.value))) {
                // console.log('password must contain digits');
                isDigit = false;
            } else {
                isDigit = true;
            }
            if (!/[A-Za-z]/.test(c.value)) {
                // console.log('password must contain uppercase letter');
                isCapsOrSmallLetter = false;
            } else {
                isCapsOrSmallLetter = true;
            }
            // if (!/[a-z]/.test(c.value)) {
            //     console.log('password must contain lowercase letter');
            //     isSmallLetter = false;
            // } else {
            //     isSmallLetter = true;
            // }

            if (!/[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(c.value)) {
                // console.log('password must contain special character');
                isSpecialChar = true;
            }

            if (isDigit && isCapsOrSmallLetter && isSpecialChar === true) {
                // null is required here. otherwise form wonot submit.
                return null;
            }
            return { passwordval: true };

        };

    }

}

export class DateValidators {
    static dateLessThan(dateField1: string, dateField2: string, validatorField: { [key: string]: boolean }): ValidatorFn {
        return (c: AbstractControl): { [key: string]: boolean } | null => {
            const date1 = c.get(dateField1).value;
            const date2 = c.get(dateField2).value;
            if ((date1 !== null && date2 !== null) && date1 > date2) {
                return validatorField;
            }
            return null;
        };
    }
}
