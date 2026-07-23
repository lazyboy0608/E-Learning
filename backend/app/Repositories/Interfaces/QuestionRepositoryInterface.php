<?php

namespace App\Repositories\Interfaces;

interface QuestionRepositoryInterface
{
    public function getById(int $id);
    public function getRandomQuestions(int $limit = 10, ?int $subjectId = null);
    public function getBySubject(int $subjectId);
}
