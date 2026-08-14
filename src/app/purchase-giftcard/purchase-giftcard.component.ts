import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { GiftcardService } from '../services/giftcard.service';

function futureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    selectedDate.setHours(0, 0, 0, 0);

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (selectedDate.getTime() < now.getTime()) {
      return { pastDate: true };
    }
    return null;
  };
}

interface ModeState {
  quantity: number;
  sender_name: string;
  sender_email: string;
  payment_method: string;
  delivery_type: string;
  scheduled_at: string;
  discount_code: string;
  recipients?: Array<{
    receiver_name: string;
    receiver_email: string;
    message: string;
    delivery_type?: string;
    scheduled_at?: string;
  }>;
}

@Component({
  selector: 'app-purchase-giftcard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './purchase-giftcard.component.html',
  styleUrls: ['./purchase-giftcard.component.css']
})
export class PurchaseGiftcardComponent implements OnInit {
  purchaseForm!: FormGroup;
  isSubmitting = false;
  isSubmitted = false;
  apiErrorMessage: string = '';
  private errorTimeout: any;
  minDate: string = '';
  purchaseType: 'self' | 'gift' = 'gift';

  // Independent state persistence for both modes
  private selfState: ModeState = {
    quantity: 1,
    sender_name: '',
    sender_email: '',
    payment_method: 'paypal',
    delivery_type: 'immediate',
    scheduled_at: '',
    discount_code: ''
  };

  private giftState: ModeState = {
    quantity: 1,
    sender_name: '',
    sender_email: '',
    payment_method: 'paypal',
    delivery_type: 'immediate',
    scheduled_at: '',
    discount_code: '',
    recipients: []
  };

  constructor(
    private fb: FormBuilder,
    private giftcardService: GiftcardService,
    private route: ActivatedRoute,
    public location: Location
  ) { }

  ngOnInit(): void {
    const now = new Date();
    this.minDate = now.toISOString().split('T')[0];

    let initialType: 'self' | 'gift' = 'gift';

    // Check query params for initial purchase type
    this.route.queryParams.subscribe(params => {
      if (params['type'] === 'self') {
        initialType = 'self';
      } else if (params['type'] === 'gift') {
        initialType = 'gift';
      }
    });

    this.purchaseType = initialType;

    this.purchaseForm = this.fb.group({
      product_id: ['prod_premium_annual', Validators.required],
      plan_id: [3, [Validators.required]],
      purchase_type: [this.purchaseType, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      sender_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      sender_email: ['', [Validators.required, Validators.email]],
      payment_method: ['paypal', Validators.required],
      delivery_type: ['immediate', Validators.required],
      scheduled_at: [''],
      discount_code: [''],
      recipients: this.fb.array([]),
    });

    this.restoreStateForType(this.purchaseType);

    // Global scheduled_at validation dynamically based on delivery_type
    this.purchaseForm.get('delivery_type')?.valueChanges.subscribe(val => {
      const scheduledDateControl = this.purchaseForm.get('scheduled_at');
      if (val === 'scheduled') {
        scheduledDateControl?.setValidators([Validators.required, futureDateValidator()]);
      } else {
        scheduledDateControl?.clearValidators();
        scheduledDateControl?.setValue('');
      }
      scheduledDateControl?.updateValueAndValidity();
    });

    // Auto-update product_id based on plan_id
    this.purchaseForm.get('plan_id')?.valueChanges.subscribe((planId) => {
      const val = Number(planId);
      const productId = val === 3 ? 'prod_premium_annual' : 'prod_premium_monthly';
      this.purchaseForm.get('product_id')?.setValue(productId, { emitEvent: false });
    });
  }

  get recipients(): FormArray {
    return this.purchaseForm.get('recipients') as FormArray;
  }

  createRecipientGroup(data?: {
    receiver_name?: string;
    receiver_email?: string;
    message?: string;
    delivery_type?: string;
    scheduled_at?: string;
  }): FormGroup {
    const group = this.fb.group({
      receiver_name: [data?.receiver_name || '', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      receiver_email: [data?.receiver_email || '', [Validators.required, Validators.email]],
      message: [data?.message || '', [Validators.maxLength(500)]],
      delivery_type: [data?.delivery_type || 'immediate', [Validators.required]],
      scheduled_at: [data?.scheduled_at || '']
    });

    group.get('delivery_type')?.valueChanges.subscribe(val => {
      const scheduledDateControl = group.get('scheduled_at');
      if (val === 'scheduled') {
        scheduledDateControl?.setValidators([Validators.required, futureDateValidator()]);
      } else {
        scheduledDateControl?.clearValidators();
        scheduledDateControl?.setValue('');
      }
      scheduledDateControl?.updateValueAndValidity();
    });

    if (data?.delivery_type === 'scheduled') {
      group.get('scheduled_at')?.setValidators([Validators.required, futureDateValidator()]);
    }

    return group;
  }

  setPurchaseType(type: 'self' | 'gift'): void {
    if (this.purchaseType === type) return;

    // 1. Save current active tab state
    this.saveCurrentState();

    // 2. Switch type
    this.purchaseType = type;
    this.purchaseForm.get('purchase_type')?.setValue(type, { emitEvent: false });

    // 3. Restore target tab state (restores independent quantity & form fields)
    this.restoreStateForType(type);

    // 4. Reset validation state so errors do not persist across tabs
    this.resetFormValidation();
  }

  private saveCurrentState(): void {
    if (!this.purchaseForm) return;

    const raw = this.purchaseForm.getRawValue();
    if (this.purchaseType === 'self') {
      this.selfState = {
        quantity: Math.max(1, Number(raw.quantity) || 1),
        sender_name: raw.sender_name || '',
        sender_email: raw.sender_email || '',
        payment_method: raw.payment_method || 'paypal',
        delivery_type: raw.delivery_type || 'immediate',
        scheduled_at: raw.scheduled_at || '',
        discount_code: raw.discount_code || ''
      };
    } else {
      this.giftState = {
        quantity: Math.max(1, Number(raw.quantity) || 1),
        sender_name: raw.sender_name || '',
        sender_email: raw.sender_email || '',
        payment_method: raw.payment_method || 'paypal',
        delivery_type: raw.delivery_type || 'immediate',
        scheduled_at: raw.scheduled_at || '',
        discount_code: raw.discount_code || '',
        recipients: (raw.recipients || []).map((r: any) => ({
          receiver_name: r.receiver_name || '',
          receiver_email: r.receiver_email || '',
          message: r.message || '',
          delivery_type: r.delivery_type || 'immediate',
          scheduled_at: r.scheduled_at || ''
        }))
      };
    }
  }

  private restoreStateForType(type: 'self' | 'gift'): void {
    const targetState = type === 'self' ? this.selfState : this.giftState;

    this.purchaseForm.patchValue({
      purchase_type: type,
      quantity: targetState.quantity,
      sender_name: targetState.sender_name,
      sender_email: targetState.sender_email,
      payment_method: targetState.payment_method,
      delivery_type: targetState.delivery_type,
      scheduled_at: targetState.scheduled_at,
      discount_code: targetState.discount_code
    }, { emitEvent: false });

    this.recipients.clear();

    if (type === 'gift') {
      const savedRecipients = targetState.recipients || [];
      const targetQty = Math.max(1, targetState.quantity);
      for (let i = 0; i < targetQty; i++) {
        const savedData = savedRecipients[i] || undefined;
        this.recipients.push(this.createRecipientGroup(savedData));
      }
    }
  }

  private resetFormValidation(): void {
    this.isSubmitted = false;

    this.purchaseForm.markAsUntouched();
    this.purchaseForm.markAsPristine();

    Object.keys(this.purchaseForm.controls).forEach(key => {
      const control = this.purchaseForm.get(key);
      if (key !== 'recipients') {
        control?.markAsUntouched();
        control?.markAsPristine();
        control?.setErrors(null);
      }
    });

    this.recipients.controls.forEach(group => {
      group.markAsUntouched();
      group.markAsPristine();
      if (group instanceof FormGroup) {
        Object.keys(group.controls).forEach(key => {
          const control = group.get(key);
          control?.markAsUntouched();
          control?.markAsPristine();
          control?.setErrors(null);
        });
      }
    });
  }

  incrementQuantity(): void {
    const currentVal = parseInt(this.purchaseForm.get('quantity')?.value || 1, 10);
    const newVal = currentVal + 1;
    this.purchaseForm.get('quantity')?.setValue(newVal);
    if (this.purchaseType === 'gift') {
      this.syncRecipientsWithQuantity(newVal);
    }
  }

  decrementQuantity(): void {
    const currentVal = parseInt(this.purchaseForm.get('quantity')?.value || 1, 10);
    if (currentVal > 1) {
      const newVal = currentVal - 1;
      this.purchaseForm.get('quantity')?.setValue(newVal);
      if (this.purchaseType === 'gift') {
        this.syncRecipientsWithQuantity(newVal);
      }
    }
  }

  onQuantityChange(event: Event): void {
    const qty = parseInt((event.target as HTMLInputElement).value, 10) || 1;
    const finalQty = Math.max(1, qty);
    this.purchaseForm.get('quantity')?.setValue(finalQty, { emitEvent: false });
    if (this.purchaseType === 'gift') {
      this.syncRecipientsWithQuantity(finalQty);
    }
  }

  syncRecipientsWithQuantity(targetQty: number): void {
    const currentQty = this.recipients.length;
    if (targetQty > currentQty) {
      for (let i = currentQty; i < targetQty; i++) {
        this.recipients.push(this.createRecipientGroup());
      }
    } else if (targetQty < currentQty) {
      for (let i = currentQty - 1; i >= targetQty; i--) {
        this.recipients.removeAt(i);
      }
    }
  }

  addRecipient(): void {
    if (this.purchaseType === 'gift') {
      this.recipients.push(this.createRecipientGroup());
      this.purchaseForm.get('quantity')?.setValue(this.recipients.length);
    }
  }

  removeRecipient(index: number): void {
    if (this.purchaseType === 'gift' && this.recipients.length > 1) {
      this.recipients.removeAt(index);
      this.purchaseForm.get('quantity')?.setValue(this.recipients.length);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.purchaseForm.get(fieldName);
    return !!(control && control.invalid && (control.touched || this.isSubmitted));
  }

  isRecipientFieldInvalid(index: number, fieldName: string): boolean {
    const recipientGroup = this.recipients.at(index) as FormGroup;
    const control = recipientGroup?.get(fieldName);
    return !!(control && control.invalid && (control.touched || this.isSubmitted));
  }

  onSubmit(): void {
    this.isSubmitted = true;

    // Validate recipient scheduling when 2+ recipients
    if (this.purchaseType === 'gift' && this.recipients.length >= 2) {
      this.recipients.controls.forEach(group => {
        const delType = group.get('delivery_type')?.value;
        const schedAt = group.get('scheduled_at');
        if (delType === 'scheduled') {
          schedAt?.setValidators([Validators.required, futureDateValidator()]);
          schedAt?.updateValueAndValidity();
        } else {
          schedAt?.clearValidators();
          schedAt?.updateValueAndValidity();
        }
      });
    }

    if (this.purchaseForm.invalid) {
      this.purchaseForm.markAllAsTouched();
      return;
    }

    this.clearApiError();
    this.isSubmitting = true;
    const rawValue = this.purchaseForm.getRawValue();

    const payload: any = {
      product_id: rawValue.product_id,
      plan_id: Number(rawValue.plan_id),
      purchase_type: rawValue.purchase_type,
      quantity: Number(rawValue.quantity),
      sender_name: rawValue.sender_name,
      sender_email: rawValue.sender_email,
      payment_method: rawValue.payment_method
    };

    if (rawValue.discount_code) {
      payload.discount_code = rawValue.discount_code;
    }

    if (rawValue.purchase_type === 'gift') {
      if (rawValue.recipients && rawValue.recipients.length > 0) {
        payload.recipients = rawValue.recipients.map((rec: any) => {
          const recObj: any = {
            receiver_name: rec.receiver_name,
            receiver_email: rec.receiver_email,
            message: rec.message || ''
          };

          if (rawValue.recipients.length >= 2) {
            recObj.delivery_type = rec.delivery_type || 'immediate';
            if (rec.delivery_type === 'scheduled' && rec.scheduled_at) {
              recObj.scheduled_at = rec.scheduled_at;
            }
          } else {
            // For single recipient, the delivery options are tracked at the form level
            recObj.delivery_type = rawValue.delivery_type || 'immediate';
            if (rawValue.delivery_type === 'scheduled' && rawValue.scheduled_at) {
              recObj.scheduled_at = rawValue.scheduled_at;
            }
          }
          return recObj;
        });
      }
    } else {
      payload.delivery_type = rawValue.delivery_type || 'immediate';
      if (rawValue.delivery_type === 'scheduled' && rawValue.scheduled_at) {
        payload.scheduled_at = rawValue.scheduled_at;
      }
    }

    this.giftcardService.purchaseGiftcard(payload).subscribe({
      next: (response) => {
        if (response.success === false) {
          this.isSubmitting = false;
          this.showApiError(response.message || 'An error occurred during purchase.');
          return;
        }
        if (response.data && response.data.gift_card_id) {
          const PayLoad = {
            payment_method: payload.payment_method,
            parent_order_id: response.data.parent_order_id
          };
          this.giftcardService.payment(PayLoad).subscribe({
            next: (res) => {
              if (res.success && res.data?.checkout_url) {
                this.isSubmitting = false;
                window.location.href = res.data.checkout_url;
              } else {
                this.isSubmitting = false;
              }
            },
            error: (err) => {
              this.isSubmitting = false;
              this.showApiError(err?.error?.message || 'Payment initiation failed. Please try again.');
              console.error('Payment API Error:', err);
            }
          });
        } else if (response.checkout_url) {
          window.location.href = response.checkout_url;
        } else {
          this.isSubmitting = false;
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.showApiError(err?.error?.message || 'An error occurred during purchase. Please try again.');
        console.error('Purchase Gift Card API Error:', err);
      }
    });
  }

  private showApiError(message: string): void {
    this.apiErrorMessage = message;
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }
    this.errorTimeout = setTimeout(() => {
      this.apiErrorMessage = '';
    }, 3000);
  }

  private clearApiError(): void {
    this.apiErrorMessage = '';
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }
  }
}
