
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
  styleUrl: './course-list.css',
})
export class CourseListComponent implements OnInit {
  private courseService = inject(CourseService);

  courses = signal<CourseResponse[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showForm = signal(false);

  pageNumber = signal(1);
  pageSize = signal(10);
  totalRecords = signal(0);
  totalPages = signal(0);

  courseForm: SaveCourseRequest = this.emptyForm();

  ngOnInit(): void {
    this.loadCourses();
  }

  private emptyForm(): SaveCourseRequest {
    return {
      courseName: '',
      duration: '',
      fees: 0,
      capacity: 1,
      isActive: true
    };
  }

  openForm(): void {
    this.courseForm = this.emptyForm();
    this.errorMessage.set('');
    this.successMessage.set('');
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  saveCourse(): void {
    if (!this.courseForm.courseName.trim() || !this.courseForm.duration.trim()
        || this.courseForm.fees < 0 || this.courseForm.capacity < 1) {
      this.errorMessage.set('Please enter valid course details.');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    this.courseService.createCourse(this.courseForm).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showForm.set(false);
        this.successMessage.set('Course created successfully!');
        this.pageNumber.set(1);
        this.loadCourses();
      },
      error: (error) => {
        console.error('Course creation failed:', error);
        this.isSaving.set(false);
        this.errorMessage.set(
          error.error?.message || 'Unable to create course. Please try again.'
        );
      }
    });
  }

  loadCourses(): void {
    this.isLoading.set(true);

    this.courseService.getCourses(this.pageNumber(), this.pageSize()).subscribe({
      next: (response) => {
        this.courses.set(response.items);
        this.totalRecords.set(response.totalRecords);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.errorMessage.set('Unable to load courses.');
        this.isLoading.set(false);
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
