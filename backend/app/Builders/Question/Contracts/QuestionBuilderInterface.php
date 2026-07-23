<?php

namespace App\Builders\Question\Contracts;

interface QuestionBuilderInterface
{
    public function build(array $data): array;
}