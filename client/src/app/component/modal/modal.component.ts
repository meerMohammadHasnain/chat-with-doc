import { Component, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { ModalService } from '../../service/modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})

export class ModalComponent implements OnInit, OnDestroy {

  @Input() id: string;
  private element: any;

  constructor(
    private modalService: ModalService,
    private elementRef: ElementRef
  ) {
    this.element = elementRef.nativeElement;
  }

  ngOnInit(): void {
    let modal = this;
    if(!this.id) {
      console.log('Id missing an ID');
      return;
    }
    document.body.appendChild(this.element);
    this.element.addEventListener('click', (event: any) => {
      if(event.target.className === 'modal-background') {
        modal.close();
      }
    });
    this.modalService.add(this);
  }

  ngOnDestroy() : void {
    this.modalService.remove(this.id);
    this.element.remove();
  }

  open(): void {
    this.element.children[1].style.display = 'block';
    this.element.style.display = 'block';
    document.body.classList.add('app-modal-open');
  }

  close() : void {
    this.element.style.display = 'none';
    document.body.classList.remove('app-modal-open');
  }

}
