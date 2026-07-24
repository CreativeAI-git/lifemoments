import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  minDate: string = '';
  purchaseType: 'self' | 'gift' = 'gift';

  constructor(
    private fb: FormBuilder,
    private giftcardService: GiftcardService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const now = new Date();
    this.minDate = now.toISOString().split('T')[0];

    // Check query params for initial purchase type (self or gift)
    this.route.queryParams.subscribe(params => {
      if (params['type'] === 'self') {
        this.purchaseType = 'self';
      } else if (params['type'] === 'gift') {
        this.purchaseType = 'gift';
      }
      if (this.purchaseForm) {
        this.updateFormForPurchaseType();
      }
    });

    this.purchaseForm = this.fb.group({
      product_id: ['prod_premium_annual', Validators.required],
      plan_id: [2, [Validators.required]],
      purchase_type: [this.purchaseType, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      sender_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      sender_email: ['', [Validators.required, Validators.email]],
      payment_method: ['paypal', Validators.required],
      delivery_type: ['immediate', Validators.required],
      scheduled_at: [''],
      recipients: this.fb.array([])
    });

    this.updateFormForPurchaseType();

    // Handle scheduled_at validation dynamically based on delivery_type
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
      const productId = val === 2 ? 'prod_premium_annual' : 'prod_premium_monthly';
      this.purchaseForm.get('product_id')?.setValue(productId, { emitEvent: false });
    });
  }

  get recipients(): FormArray {
    return this.purchaseForm.get('recipients') as FormArray;
  }

  createRecipientGroup(): FormGroup {
    return this.fb.group({
      receiver_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      receiver_email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.maxLength(500)]]
    });
  }

  setPurchaseType(type: 'self' | 'gift'): void {
    this.purchaseType = type;
    this.purchaseForm.get('purchase_type')?.setValue(type);
    this.updateFormForPurchaseType();
  }

  updateFormForPurchaseType(): void {
    if (!this.purchaseForm) return;

    this.purchaseForm.get('purchase_type')?.setValue(this.purchaseType, { emitEvent: false });

    if (this.purchaseType === 'self') {
      const currentQty = Math.max(1, this.purchaseForm.get('quantity')?.value || 1);
      this.purchaseForm.get('quantity')?.setValue(currentQty, { emitEvent: false });
      this.recipients.clear();
    } else {
      const currentQty = Math.max(1, this.purchaseForm.get('quantity')?.value || 1);
      this.syncRecipientsWithQuantity(currentQty);
    }
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

  // Helper method for easy validation checking in HTML
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
    if (this.purchaseForm.invalid) {
      this.purchaseForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const rawValue = this.purchaseForm.getRawValue();

    const payload: any = {
      product_id: rawValue.product_id,
      plan_id: Number(rawValue.plan_id),
      purchase_type: rawValue.purchase_type,
      quantity: Number(rawValue.quantity),
      sender_name: rawValue.sender_name,
      sender_email: rawValue.sender_email,
      payment_method: rawValue.payment_method,
      delivery_type: rawValue.delivery_type
    };

    if (rawValue.delivery_type === 'scheduled' && rawValue.scheduled_at) {
      // Format as ISO string e.g., 2026-07-30T10:00:00Z
      const dateObj = new Date(rawValue.scheduled_at);
      payload.scheduled_at = dateObj.toISOString();
    }

    if (rawValue.purchase_type === 'gift') {
      payload.recipients = rawValue.recipients;
    }

    this.giftcardService.purchaseGiftcard(payload).subscribe({
      next: (response) => {
        if (response.data && response.data.gift_card_id) {
          const PayLoad = {
            payment_method: payload.payment_method,
            parent_order_id: response.data.parent_order_id
          };
          this.giftcardService.payment(PayLoad).subscribe({
            next: (res) => {
              if (res.success && res.data?.checkout_url) {
                window.location.href = res.data.checkout_url;
              } else {
                this.isSubmitting = false;
              }
            },
            error: (err) => {
              this.isSubmitting = false;
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
        console.error('Purchase Gift Card API Error:', err);
      }
    });
  }
}
