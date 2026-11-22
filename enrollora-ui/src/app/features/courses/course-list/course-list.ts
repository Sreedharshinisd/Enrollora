
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CourseService } from '../course.service';
import { CourseResponse, SaveCourseRequest } from '../course.models';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-list.html',
  styleUrl: './course-list.css'
})
export class CourseListComponent implements OnInit {

  private courseService = inject(CourseService);

  courses = signal<CourseResponse[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  pageNumber = signal(1);
  pageSize = signal(10);
  totalRecords = signal(0);
  totalPages = signal(0);

  showAddForm = signal(false);
  isSaving = signal(false);
  addError = signal('');

  newCourse: SaveCourseRequest = this.getEmptyCourse();

  ngOnInit(): void {
    this.loadCourses();
  }

  private getEmptyCourse(): SaveCourseRequest {
    return {
      courseName: '',
      duration: '',
      fees: 0,
      capacity: 1,
      isActive: true
    };
  }

  loadCourses(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.courseService
      .getCourses(this.pageNumber(), this.pageSize())
      .subscribe({
        next: response => {
          this.courses.set(response.items);
          this.totalRecords.set(response.totalRecords);
          this.totalPages.set(response.totalPages);
          this.isLoading.set(false);
        },
        error: error => {
          console.error('Error loading courses:', error);
          this.errorMessage.set('Unable to load courses.');
          this.isLoading.set(false);
        }
      });
  }

  openAddForm(): void {
  console.log('Add Course button clicked');

  this.newCourse = this.getEmptyCourse();
  this.addError.set('');
  this.successMessage.set('');
  this.showAddForm.set(true);
}

  closeAddForm(): void {
    this.showAddForm.set(false);
    this.addError.set('');
  }

  addCourse(): void {
    if (
      !this.newCourse.courseName.trim() ||
      !this.newCourse.duration.trim() ||
      this.newCourse.fees < 0 ||
      this.newCourse.capacity < 1
    ) {
      this.addError.set('Please enter valid course details.');
      return;
    }

    this.isSaving.set(true);
    this.addError.set('');

    this.courseService.createCourse(this.newCourse).subscribe({
      next: response => {
        this.isSaving.set(false);
        this.showAddForm.set(false);

        this.successMessage.set(
          `${response.courseName} added successfully!`
        );

        this.pageNumber.set(1);
        this.loadCourses();
      },
      error: error => {
        console.error('Error adding course:', error);
        this.isSaving.set(false);

        this.addError.set(
          error.error?.detail ||
          error.error?.message ||
          error.error?.title ||
          'Unable to add course. Please try again.'
        );
      }
    });
  }

  nextPage(): void {
    if (this.pageNumber() < this.totalPages()) {
      this.pageNumber.update(page => page + 1);
      this.loadCourses();
    }
  }

  previousPage(): void {
    if (this.pageNumber() > 1) {
      this.pageNumber.update(page => page - 1);
      this.loadCourses();
    }
  }
}
