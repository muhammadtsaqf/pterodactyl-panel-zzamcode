<?php

namespace Pterodactyl\Models;

use Illuminate\Database\Eloquent\Model;

class StoreOrder extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'store_orders';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'type',
        'server_id',
        'data',
        'amount',
        'reference_id',
        'payment_id',
        'status',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'data' => 'array',
        'amount' => 'integer',
    ];

    /**
     * Get the user that owns the order.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the server associated with the order.
     */
    public function server()
    {
        return $this->belongsTo(Server::class);
    }
}
