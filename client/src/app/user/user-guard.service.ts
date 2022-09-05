import { Injectable } from '@angular/core';
import { UserEditComponent } from './user-edit/user-edit.component';
import { CanDeactivate } from '@angular/router';


@Injectable()
export  class UserEditGuard implements CanDeactivate<UserEditComponent> {

    canDeactivate(component: UserEditComponent): boolean {
        // if (component.customerForm.dirty) {
        //     let customerName = component.customerForm.get('customerName').value || 'New Customer';
        //     return confirm(`Navigate away and lose all changes to ${customerName}?`);
        // }
        return true;
    }
}
