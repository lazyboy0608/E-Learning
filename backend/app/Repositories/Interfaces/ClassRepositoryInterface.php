<?php

namespace App\Repositories\Interfaces;

interface ClassRepositoryInterface
{
    public function getAll(array $filters = [], ?int $userId = null);
    public function getById(int $id);
    public function getByCode(string $code);
    public function create(array $data);
    public function update(int $id, array $data);
    public function delete(int $id);

    public function getStudents(int $classId);
    public function getTeachers(int $classId);
    public function getMaterials(int $classId);
    public function getTests(int $classId);

    public function addStudent(int $classId, int $userId);
    public function removeStudent(int $classId, int $userId);
    public function addTeacher(int $classId, int $userId);
    public function removeTeacher(int $classId, int $userId);

    public function addMaterial(int $classId, array $data);
    public function removeMaterial(int $classId, int $materialId);

    public function assignTest(int $classId, int $testId);
    public function removeTest(int $classId, int $testId);
}
