@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'basic'])

@section('title')
    Store Discounts
@endsection

@section('content-header')
    <h1>Store Discounts<small>Manage discount codes for your store.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Store Discounts</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <div class="col-xs-12">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">Create New Discount</h3>
            </div>
            <form action="{{ route('admin.store_discounts.store') }}" method="POST">
                <div class="box-body">
                    <div class="row">
                        <div class="form-group col-md-3">
                            <label class="control-label">Discount Code</label>
                            <div>
                                <input type="text" autocomplete="off" name="code" class="form-control" value="{{ old('code') }}" placeholder="e.g. PROMO50" required />
                                <p class="text-muted small">The unique code users will enter.</p>
                            </div>
                        </div>
                        <div class="form-group col-md-3">
                            <label class="control-label">Discount Percent (%)</label>
                            <div>
                                <input type="number" name="discount_percent" class="form-control" value="{{ old('discount_percent', 10) }}" min="1" max="100" required />
                                <p class="text-muted small">Percentage of the total price to discount.</p>
                            </div>
                        </div>
                        <div class="form-group col-md-3">
                            <label class="control-label">Maximum Uses</label>
                            <div>
                                <input type="number" name="max_uses" class="form-control" value="{{ old('max_uses') }}" min="1" />
                                <p class="text-muted small">Leave blank for unlimited uses.</p>
                            </div>
                        </div>
                        <div class="form-group col-md-3">
                            <label class="control-label">Expires At</label>
                            <div>
                                <input type="date" name="expires_at" class="form-control" value="{{ old('expires_at') }}" />
                                <p class="text-muted small">Leave blank for no expiration.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="box-footer">
                    {!! csrf_field() !!}
                    <button type="submit" class="btn btn-primary pull-right">Create Discount</button>
                </div>
            </form>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-xs-12">
        <div class="box">
            <div class="box-header with-border">
                <h3 class="box-title">Active & Expired Discounts</h3>
            </div>
            <div class="box-body table-responsive no-padding">
                <table class="table table-hover">
                    <tbody>
                        <tr>
                            <th>Code</th>
                            <th>Discount</th>
                            <th>Uses</th>
                            <th>Max Uses</th>
                            <th>Expires At</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                        @foreach ($discounts as $discount)
                            <tr>
                                <td><code>{{ $discount->code }}</code></td>
                                <td>{{ $discount->discount_percent }}%</td>
                                <td>{{ $discount->uses }}</td>
                                <td>{{ $discount->max_uses ?? '&infin;' }}</td>
                                <td>{{ $discount->expires_at ? $discount->expires_at->format('Y-m-d') : 'Never' }}</td>
                                <td>
                                    @if ($discount->isValid())
                                        <span class="label label-success">Active</span>
                                    @else
                                        <span class="label label-danger">Expired/Maxed</span>
                                    @endif
                                </td>
                                <td class="text-center">
                                    <form action="{{ route('admin.store_discounts.destroy', $discount->id) }}" method="POST">
                                        {!! csrf_field() !!}
                                        {!! method_field('DELETE') !!}
                                        <button class="btn btn-xs btn-danger"><i class="fa fa-trash"></i> Delete</button>
                                    </form>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
@endsection
