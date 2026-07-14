import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { GiftcardService } from '../services/giftcard.service';

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

  constructor(
    private fb: FormBuilder,
    private giftcardService: GiftcardService,
  ) { }

  ngOnInit(): void {
    this.purchaseForm = this.fb.group({
      product_id: ['monthly_gift_card', Validators.required],
      plan_id: [2, [Validators.required]],
      receiver_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      receiver_email: ['', [Validators.required, Validators.email]],
      sender_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      sender_email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.maxLength(500)]],
      payment_method: ['paypal', Validators.required]
    });

    // Auto-update product_id based on plan_id
    this.purchaseForm.get('plan_id')?.valueChanges.subscribe((planId) => {
      const val = Number(planId);
      const productId = val === 3 ? 'annual_gift_card' : 'monthly_gift_card';
      this.purchaseForm.get('product_id')?.setValue(productId, { emitEvent: false });
    });
  }

  // Helper method for easy validation checking in HTML
  isFieldInvalid(fieldName: string): boolean {
    const control = this.purchaseForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.purchaseForm.invalid) {
      this.purchaseForm.markAllAsTouched();
      // this.toaster.error('Please correct the validation errors in the form.', 'Form Invalid');
      return;
    }

    this.isSubmitting = true;
    const payload = { ...this.purchaseForm.value };
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
