import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-assign-message',
  template: `
    <div >
      <mat-dialog-actions>
        <button class="mat-raised-button mat-primary" style="text-align:right;" (click)="close()">Close</button>
      </mat-dialog-actions>
    </div>
    <p>
      {{message}}
    </p>

  `,
  styles: []
})
export class AssignMessageComponent implements OnInit {
  message = '';
  constructor(private dialogRef: MatDialogRef<AssignMessageComponent>,
    @Inject(MAT_DIALOG_DATA) data) { 
      this.message = data.message;
  }

  ngOnInit() {
  }

  close() {
    this.dialogRef.close();
  }

}
