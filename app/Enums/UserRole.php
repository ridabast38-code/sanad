<?php

namespace App\Enums;

enum UserRole: string
{
    case Client = 'client';
    case Practitioner = 'practitioner';
    case Admin = 'admin';
}
