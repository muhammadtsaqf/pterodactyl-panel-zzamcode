<?php

namespace Pterodactyl\Models;

use Illuminate\Database\Eloquent\Model;

class StoreDiscount extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'store_discounts';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'code',
        'discount_percent',
        'max_uses',
        'uses',
        'expires_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'discount_percent' => 'integer',
        'max_uses' => 'integer',
        'uses' => 'integer',
        'expires_at' => 'datetime',
    ];

    /**
     * Determine if the discount code is still valid.
     */
    public function isValid(): bool
    {
        if ($this->max_uses !== null && $this->uses >= $this->max_uses) {
            return false;
        }

        if ($this->expires_at !== null && $this->expires_at->isPast()) {
            return false;
        }

        return true;
    }
}
