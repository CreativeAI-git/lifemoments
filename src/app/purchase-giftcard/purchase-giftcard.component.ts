import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { GiftcardService } from '../services/giftcard.service';

function futureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    selectedDate.setHours(0, 0, 0, 0);

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // To ignore past dates, check if selected date is before today
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
  isMyself = false;
  minDate: string = '';

  constructor(
    private fb: FormBuilder,
    private giftcardService: GiftcardService,
  ) { }

  ngOnInit(): void {
    const now = new Date();
    this.minDate = now.toISOString().split('T')[0];

    this.purchaseForm = this.fb.group({
      product_id: ['annual_gift_card', Validators.required],
      plan_id: [3, [Validators.required]],
      receiver_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      receiver_email: ['', [Validators.required, Validators.email]],
      sender_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      sender_email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.maxLength(500)]],
      delivery_type: ['immediate', Validators.required],
      scheduled_at: ['', []],
      payment_method: ['paypal', Validators.required]
    });

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
      const productId = val === 3 ? 'annual_gift_card' : 'monthly_gift_card';
      this.purchaseForm.get('product_id')?.setValue(productId, { emitEvent: false });
    });

    // Sync sender info to recipient info if 'Myself' is checked
    this.purchaseForm.get('sender_name')?.valueChanges.subscribe(val => {
      if (this.isMyself) {
        this.purchaseForm.get('receiver_name')?.setValue(val, { emitEvent: false });
      }
    });

    this.purchaseForm.get('sender_email')?.valueChanges.subscribe(val => {
      if (this.isMyself) {
        this.purchaseForm.get('receiver_email')?.setValue(val, { emitEvent: false });
      }
    });
  }

  onMyselfChange(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.isMyself = isChecked;
    const receiverNameControl = this.purchaseForm.get('receiver_name');
    const receiverEmailControl = this.purchaseForm.get('receiver_email');

    if (isChecked) {
      receiverNameControl?.disable();
      receiverEmailControl?.disable();
      receiverNameControl?.setValue(this.purchaseForm.get('sender_name')?.value);
      receiverEmailControl?.setValue(this.purchaseForm.get('sender_email')?.value);
    } else {
      receiverNameControl?.enable();
      receiverEmailControl?.enable();
      receiverNameControl?.setValue('');
      receiverEmailControl?.setValue('');
    }
  }

  // Helper method for easy validation checking in HTML
  isFieldInvalid(fieldName: string): boolean {
    const control = this.purchaseForm.get(fieldName);
    return !!(control && control.invalid && this.isSubmitted);
  }

  onSubmit(): void {
    this.isSubmitted = true;
    if (this.purchaseForm.invalid) {
      this.purchaseForm.markAllAsTouched();
      // this.toaster.error('Please correct the validation errors in the form.', 'Form Invalid');
      return;
    }

    this.isSubmitting = true;
    const payload = { ...this.purchaseForm.getRawValue() };
    payload.plan_id = Number(payload.plan_id);

    this.giftcardService.purchaseGiftcard(payload).subscribe({
      next: (response) => {
        const PayLoad = {
          gift_card_id: response.data.gift_card_id,
          payment_method: response.data.payment_method
        }
        this.giftcardService.payment(PayLoad).subscribe({
          next: (res) => {
            if (res.success) {
              window.location.href = res.data.checkout_url;
            }
          },
          error: (err) => {
            console.error('API Error:', err);
          }
        })
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('API Error:', err);
      }
    });
  }
}
