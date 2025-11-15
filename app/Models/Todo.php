<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Todo extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'is_finished',
        'cover',
    ];

    protected $casts = [
        'is_finished' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
